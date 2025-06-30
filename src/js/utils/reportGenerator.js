import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

/**
 * Utility class untuk generate laporan dalam format PDF dan Excel
 */
class ReportGenerator {
  /**
   * Generate PDF report dari data summary
   * @param {Object} summaryData - Data summary dari API
   * @param {string} period - Period filter yang digunakan
   */ generatePDF(summaryData, period = "all") {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text("Attendance Summary Report", 20, 20);

    // Period info
    doc.setFontSize(12);
    doc.text(`Period: ${this.formatPeriod(period)}`, 20, 35);
    doc.text(`Generated on: ${new Date().toLocaleDateString("id-ID")}`, 20, 45);
    // Summary statistics
    if (summaryData.summary) {
      doc.setFontSize(14);
      doc.text("Summary Statistics", 20, 65);

      const summaryRows = [
        ["On Time", summaryData.summary.total_ontime || "0"],
        ["Late", summaryData.summary.total_late || "0"],
        ["Alpha (Absent)", summaryData.summary.total_alpha || "0"],
        ["Work From Office", summaryData.summary.total_wfo || "0"],
        ["Work From Home", summaryData.summary.total_wfh || "0"],
        ["Work From Anywhere", summaryData.summary.total_wfa || "0"],
      ];

      autoTable(doc, {
        startY: 75,
        head: [["Category", "Count"]],
        body: summaryRows,
        theme: "grid",
        styles: { fontSize: 10 },
        headStyles: { fillColor: [59, 130, 246] },
      });
    } // Attendance report table
    if (
      summaryData.report &&
      summaryData.report.data &&
      summaryData.report.data.length > 0
    ) {
      const reportStartY = doc.lastAutoTable
        ? doc.lastAutoTable.finalY + 20
        : 100;

      doc.setFontSize(14);
      doc.text("Attendance Report", 20, reportStartY);

      const reportColumns = [
        "Name",
        "NIP/NIM",
        "Role",
        "Date",
        "Check In",
        "Check Out",
        "Work Hour",
        "Status",
        "Work Category",
        "Discipline Score",
        "Discipline Label",
      ];
      const reportRows = summaryData.report.data.map((item) => [
        item.full_name || "-",
        item.nip_nim || "-",
        item.role || "-",
        item.attendance_date || "-",
        item.time_in || "-",
        item.time_out || "-",
        item.work_hour || "-",
        item.status || "-",
        item.location_details?.category || item.information || "-",
        item.discipline_score || "0",
        item.discipline_label || "Unknown",
      ]);

      autoTable(doc, {
        startY: reportStartY + 10,
        head: [reportColumns],
        body: reportRows,
        theme: "grid",
        styles: { fontSize: 7 },
        headStyles: { fillColor: [59, 130, 246] },
        columnStyles: {
          0: { cellWidth: 18 }, // Name
          1: { cellWidth: 12 }, // NIP/NIM
          2: { cellWidth: 12 }, // Role
          3: { cellWidth: 12 }, // Date
          4: { cellWidth: 10 }, // Check In
          5: { cellWidth: 10 }, // Check Out
          6: { cellWidth: 10 }, // Work Hour
          7: { cellWidth: 10 }, // Status
          8: { cellWidth: 15 }, // Work Category
          9: { cellWidth: 12 }, // Discipline Score
          10: { cellWidth: 15 }, // Discipline Label
        },
      });
    }

    // Save the PDF
    const fileName = `attendance-report-${period}-${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
  }

  /**
   * Generate Excel report dari data summary
   * @param {Object} summaryData - Data summary dari API
   * @param {string} period - Period filter yang digunakan
   */
  generateExcel(summaryData, period = "all") {
    const workbook = XLSX.utils.book_new();

    // Summary sheet
    if (summaryData.summary) {
      const summaryData_ws = [
        ["Attendance Summary Report"],
        [""],
        ["Period:", this.formatPeriod(period)],
        ["Generated on:", new Date().toLocaleDateString("id-ID")],
        [""],
        ["Category", "Count"],
        ["On Time", summaryData.summary.total_ontime || 0],
        ["Late", summaryData.summary.total_late || 0],
        ["Alpha (Absent)", summaryData.summary.total_alpha || 0],
        ["Work From Office", summaryData.summary.total_wfo || 0],
        ["Work From Home", summaryData.summary.total_wfh || 0],
        ["Work From Anywhere", summaryData.summary.total_wfa || 0],
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData_ws);

      // Style the header
      summarySheet["A1"] = {
        v: "Attendance Summary Report",
        t: "s",
        s: { font: { bold: true, sz: 16 } },
      };

      XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
    }
    // Report sheet
    if (
      summaryData.report &&
      summaryData.report.data &&
      summaryData.report.data.length > 0
    ) {
      const reportData = [
        [
          "Name",
          "NIP/NIM",
          "Role",
          "Email",
          "Date",
          "Check In",
          "Check Out",
          "Work Hour",
          "Status",
          "Work Category",
          "Information",
          "Notes",
          "Discipline Score",
          "Discipline Label",
        ],
        ...summaryData.report.data.map((item) => [
          item.full_name || "-",
          item.nip_nim || "-",
          item.role || "-",
          item.email || "-",
          item.attendance_date || "-",
          item.time_in || "-",
          item.time_out || "-",
          item.work_hour || "-",
          item.status || "-",
          item.location_details?.category || item.information || "-",
          item.information || "-",
          item.notes || "-",
          item.discipline_score || "0",
          item.discipline_label || "Unknown",
        ]),
      ];

      const reportSheet = XLSX.utils.aoa_to_sheet(reportData);
      XLSX.utils.book_append_sheet(workbook, reportSheet, "Attendance Report");
    }

    // Save the Excel file
    const fileName = `attendance-report-${period}-${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  /**
   * Format period untuk display
   * @param {string} period - Period value
   * @returns {string} Formatted period string
   */
  formatPeriod(period) {
    const periodMap = {
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
      all: "All Time",
    };

    return periodMap[period] || period;
  }
}

// Export singleton instance
export const reportGenerator = new ReportGenerator();

// Export convenience functions
export const generatePDFReport = (summaryData, period) =>
  reportGenerator.generatePDF(summaryData, period);
export const generateExcelReport = (summaryData, period) =>
  reportGenerator.generateExcel(summaryData, period);
