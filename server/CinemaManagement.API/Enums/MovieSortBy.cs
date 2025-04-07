using System.Text.Json.Serialization;

namespace CinemaManagement.API.Enums
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum MovieSortBy
    {
        CreatedAt,
        StartAt,
        EndAt
    }
}
