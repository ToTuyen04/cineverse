using System.Text.Json.Serialization;

namespace CinemaManagement.API.Enums
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum SortOrder
    {
        Ascending,
        Descending
    }
}
