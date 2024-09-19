using Microsoft.AspNetCore.Http;

namespace Web_API.Model
{
    public class ImageUpload
    {
        public IFormFile Image { get; set; }
    }
}
