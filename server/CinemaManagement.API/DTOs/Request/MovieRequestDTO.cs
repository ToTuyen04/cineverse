namespace CinemaManagement.API.DTOs.Request
{
    public class MovieRequestDTO
    {
        public class MovieCreateDTO
        {
            public string? MovieName { get; set; }
            public IFormFile? MoviePoster { get; set; }
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
            public bool? MovieAvailable { get; set; }
            public List<int> GenreIds { get; set; } = new List<int>();
        }

        public class MovieUpdateDTO
        {
            public string? MovieName { get; set; }
            public IFormFile? MoviePoster { get; set; }
            public string? MovieTrailer { get; set; }
            //public DateTime? MovieCreatAt { get; set; }
            public DateTime? MovieStartAt { get; set; }
            public DateTime? MovieEndAt { get; set; }
            public string? MovieActor { get; set; }
            public string? MovieDirector { get; set; }
            public string? MovieBrand { get; set; }
            public int? MovieDuration { get; set; }
            public int? MovieVersion { get; set; }
            public string? MovieContent { get; set; }
            public bool? MovieAvailable { get; set; }
            public List<int> GenreIds { get; set; } = new List<int>();
        }
    }
}
