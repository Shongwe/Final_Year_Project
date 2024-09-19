namespace Web_API.Model
{
    public class AvailabilityPeriod
    {
        public int Id { get; set; }
        public int VehicleId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public Vehicle Vehicle { get; set; }
    }
}
