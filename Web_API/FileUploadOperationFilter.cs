using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Linq;
using System.Reflection;
using Web_API.Model;

namespace Web_API
{
    public class FileUploadOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            var formFileParameters = context.MethodInfo.GetParameters()
                .Where(p => p.ParameterType.IsAssignableFrom(typeof(ImageUpload)))
                .SelectMany(p => p.ParameterType.GetProperties())
                .Where(p => p.PropertyType == typeof(IFormFile));

            if (formFileParameters.Any())
            {
                if (operation.RequestBody == null)
                {
                    operation.RequestBody = new OpenApiRequestBody();
                }

                operation.RequestBody.Content["multipart/form-data"] = new OpenApiMediaType
                {
                    Schema = new OpenApiSchema
                    {
                        Type = "object",
                        Properties = formFileParameters.ToDictionary(
                            p => p.Name,
                            p => new OpenApiSchema
                            {
                                Type = "string",
                                Format = "binary"
                            }
                        )
                    }
                };
            }
        }
    }
}
