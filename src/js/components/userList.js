export const userListAlpineData = () => ({
  users: [
    {
      id: "USR001",
      fullName: "Ahmad Suryana",
      email: "ahmad.s@example.com",
      position: "IT Manager",
      nipNim: "199001012023031001",
      phoneNumber: "081234567890",
      address: "Jakarta",
      role: "Admin",
      avatar: null,
      initials: "AS",
      avatarColor: "bg-blue-100 text-blue-600",
    },
    {
      id: "USR002",
      fullName: "Sari Pertiwi",
      email: "sari.pertiwi@example.com",
      position: "Software Engineer",
      nipNim: "F55121001",
      phoneNumber: "082345678901",
      address: "Bandung",
      role: "User",
      avatar: null,
      initials: "SP",
      avatarColor: "bg-green-100 text-green-600",
    },
    {
      id: "USR003",
      fullName: "Budi Prasetyo",
      email: "budi.prasetyo@example.com",
      position: "Project Manager",
      nipNim: "199505152024011002",
      phoneNumber: "083456789012",
      address: "Surabaya",
      role: "Manager",
      avatar: null,
      initials: "BP",
      avatarColor: "bg-purple-100 text-purple-600",
    },
    {
      id: "USR004",
      fullName: "Dewi Lestari",
      email: "dewi.lestari@example.com",
      position: "UI/UX Designer",
      nipNim: "F55121002",
      phoneNumber: "084567890123",
      address: "Yogyakarta",
      role: "User",
      avatar: null,
      initials: "DL",
      avatarColor: "bg-orange-100 text-orange-600",
    },
    {
      id: "USR005",
      fullName: "Rizki Hidayat",
      email: "rizki.hidayat@example.com",
      position: "DevOps Engineer",
      nipNim: "199803252024031003",
      phoneNumber: "085678901234",
      address: "Medan",
      role: "Supervisor",
      avatar: null,
      initials: "RH",
      avatarColor: "bg-red-100 text-red-600",
    },
  ],
  searchQuery: "",
  entriesPerPage: 10,
  currentPage: 1,

  get filteredUsers() {
    if (!this.searchQuery) return this.users;
    return this.users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.position.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.id.toLowerCase().includes(this.searchQuery.toLowerCase()),
    );
  },

  get paginatedUsers() {
    const start = (this.currentPage - 1) * this.entriesPerPage;
    const end = start + this.entriesPerPage;
    return this.filteredUsers.slice(start, end);
  },

  get totalPages() {
    return Math.ceil(this.filteredUsers.length / this.entriesPerPage);
  },

  get showingInfo() {
    const start = (this.currentPage - 1) * this.entriesPerPage + 1;
    const end = Math.min(
      this.currentPage * this.entriesPerPage,
      this.filteredUsers.length,
    );
    return `Showing ${start} to ${end} of ${this.filteredUsers.length} entries`;
  },

  editUser(userId) {
    console.log("Edit user:", userId);
    // Implement edit functionality
  },

  deleteUser(userId) {
    console.log("Delete user:", userId);
    if (confirm("Are you sure you want to delete this user?")) {
      this.users = this.users.filter((user) => user.id !== userId);
    }
  },

  viewUser(userId) {
    console.log("View user:", userId);
    // Implement view functionality
  },

  goToPage(page) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  },

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  },

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  },

  getPageNumbers() {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  },
});
