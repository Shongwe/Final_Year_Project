using Web_API.Model;

namespace Web_API.ViewModel
{
    public class AddCarAndImage
    {
        public Vehicle? vehicle {  get; set; }
        public IFormFile? carImage { get; set; } 
    }
}
