namespace Web_API.Model
{
    public class RevenueReport
    {
        public int RevenueReportId { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
        public double TotalRevenue { get; set; }
    }
}
