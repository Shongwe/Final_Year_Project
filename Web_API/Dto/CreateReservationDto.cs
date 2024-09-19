namespace Web_API.Dto
{
    public class CreateReservationDto
    {
        public string UserId { get; set; }  
        public int VehicleId { get; set; }
        public DateTime PickUpDate { get; set; }
        public DateTime ReturnDate { get; set; }
    }
}
