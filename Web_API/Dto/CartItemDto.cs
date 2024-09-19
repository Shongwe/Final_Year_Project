﻿namespace Web_API.Dto
{
    public class CartItemDto
    {
        public int CartItemId { get; set; }
        public int VehicleId { get; set; }
        public String UserId { get; set; } = string.Empty;
        public double DailyRate { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public double TotalPrice { get; set; }
        public int Deleted { get; set; } = 0;
    }
}
