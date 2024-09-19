namespace Web_API.Model
{
    public class Rental
    {
        public int RentalId { get; set; }
        public string UserId { get; set; }
        public int VehicleId { get; set; }
        public DateTime PickUpDate { get; set; }
        public DateTime DropOffDate { get; set; }
        public double TotalCost { get; set; }

        public User Customer { get; set; }
        public Vehicle Vehicle { get; set; }
        public ICollection<Payment> Payments { get; set; }
    }
}
