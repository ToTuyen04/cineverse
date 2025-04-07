namespace CinemaManagement.API.DTOs.Response
{
    public class MovieResponseDTO
    {
        public int MovieId { get; set; }

        public string? MovieName { get; set; }

        public string? MoviePoster { get; set; }
        public string? MovieTrailer { get; set; }

        public DateTime? MovieCreatAt { get; set; }

        public DateTime? MovieStartAt { get; set; }

        public DateTime? MovieEndAt { get; set; }

        public string? MovieActor { get; set; }

        public string? MovieDirector { get; set; }

        public string? MovieBrand { get; set; }

        public int? MovieDuration { get; set; }

        public int? MovieVersion { get; set; }

        public string? MovieContent { get; set; }

        public int? MovieCreatedBy { get; set; }

        public int? MovieUpdateBy { get; set; }
        public bool? MovieAvailable { get; set; }

        public List<GenresResponseDTO> Genres { get; set; }
    }
}
