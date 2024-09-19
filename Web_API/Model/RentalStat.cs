namespace Web_API.Model
{
    public class RentalStat
    {
        public int RentalStatId { get; set; }
        public DateTime Date { get; set; }
        public int TotalRentals { get; set; }
        public double TotalRevenue { get; set; }
        public int TotalCustomers { get; set; }
        public double AverageRentalDuration { get; set; }
    }
}
