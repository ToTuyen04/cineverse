using System;
using System.Collections.Generic;

namespace CinemaManagement.API.Entities;

public partial class Movie
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

    public string? MovieSearchName { get; set; }

    public bool? MovieAvailable { get; set; }

    public virtual Staff? MovieCreatedByNavigation { get; set; }

    public virtual ICollection<MovieGenre> MovieGenres { get; set; } = new List<MovieGenre>();

    public virtual Staff? MovieUpdateByNavigation { get; set; }

    public virtual ICollection<Showtime> Showtimes { get; set; } = new List<Showtime>();
}
