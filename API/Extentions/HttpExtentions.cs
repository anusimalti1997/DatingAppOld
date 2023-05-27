using API.Helpers;
using System.Text.Json;

namespace API.Extentions
{
    public static class HttpExtentions
    {
        public static void addPaginationHeader(this HttpResponse response, PaginationHeader header)
        {
            var jsonOtions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            response.Headers.Add("Pagination", JsonSerializer.Serialize(header,jsonOtions));
            response.Headers.Add("Access-Control-Expose-Headers","Pagination");
        } 
    }
}
