namespace Web_API.Model
{
    public class VehicleStat
    {
        public int VehicleStatId { get; set; }
        public int VehicleId { get; set; }
        public DateTime Date { get; set; }
        public int MilesDriven { get; set; }
        public int TimesRented { get; set; }

        public Vehicle Vehicle { get; set; }
    }
}
