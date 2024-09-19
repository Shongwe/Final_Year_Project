namespace Web_API.Model
{
    public class Reservation
    {
        public int ReservationId { get; set; }
        public string UserId { get; set; }
        public int VehicleId { get; set; }
        public DateTime ReservationDate { get; set; }
        public DateTime PickUpDate { get; set; }
        public DateTime ReturnDate { get; set; }
        public string ReservationStatus { get; set; }

        public User Customer { get; set; }
        public Vehicle Vehicle { get; set; }
    }
}
