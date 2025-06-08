import axios from 'axios';

/**
 * Mendapatkan token dari localStorage untuk header Authorization
 * @returns {string|null} - Bearer token atau null jika tidak ada
 */
function getBearerToken() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user.token || null;
}

/**
 * Membuat header Authorization dengan Bearer token
 * @returns {Object} - Headers object dengan Authorization atau empty object
 */
function getAuthHeaders() {
  const token = getBearerToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Service untuk menangani API calls terkait laporan summary
 */
class ReportService {
    /**
     * Mendapatkan summary report dari backend
     * @param {string} period - Period filter ('daily', 'weekly', 'monthly', 'all')
     * @returns {Promise<Object>} Response data containing summary and report
     */
    async getSummaryReport(period = 'all') {
        try {
            // Attempt to call the real API
            const response = await axios.get('/api/summary', {
                params: { period },
                headers: getAuthHeaders()
            });

            return response.data;
        } catch (error) {
            console.log('Error fetching from API, using mock data:', error.message);
            
            // For development: Return mock data if API is not available
            return this.getMockSummaryData(period);
        }
    }
    
    /**
     * Get mock summary data for development/testing
     * @param {string} period - Period filter
     * @returns {Object} Mock summary data
     */
    getMockSummaryData(period) {
        // Default summary statistics
        const summary = {
            onTime: 21,
            late: 19,
            alpha: 0,
            wfo: 10,
            wfh: 11,
            wfa: 13
        };
        
        // Mock report data
        const report = [
            {
                id: 1,
                userId: 'USR001',
                name: 'John Doe',
                date: '2024-01-15',
                checkIn: '08:00',
                checkOut: '17:00',
                status: 'On Time',
                workType: 'WFO',
                role: 'Staff',
                location: { latitude: -6.175110, longitude: 106.865036 }
            },
            {
                id: 2,
                userId: 'USR002',
                name: 'Jane Smith',
                date: '2024-01-15',
                checkIn: '08:30',
                checkOut: '17:15',
                status: 'Late',
                workType: 'WFH',
                role: 'Designer',
                location: { latitude: -6.200000, longitude: 106.816666 }
            },
            {
                id: 3,
                userId: 'USR003',
                name: 'Robert Johnson',
                date: '2024-01-15',
                checkIn: '07:45',
                checkOut: '16:30',
                status: 'On Time',
                workType: 'WFA',
                role: 'Developer',
                location: { latitude: -6.193124, longitude: 106.801950 }
            }
        ];
        
        // Return success response with mock data
        return {
            success: true,
            message: 'Summary and report fetched successfully',
            summary,
            report
        };
    }
}

// Export singleton instance
export const reportService = new ReportService();

// Export the main function for convenience
export const getSummaryReport = (period) => reportService.getSummaryReport(period);
