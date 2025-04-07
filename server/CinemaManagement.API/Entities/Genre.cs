using System;
using System.Collections.Generic;

namespace CinemaManagement.API.Entities;

public partial class Genre
{
    public int GenresId { get; set; }

    public string? GenresName { get; set; }

    public string? GenresContent { get; set; }

    public virtual ICollection<MovieGenre> MovieGenres { get; set; } = new List<MovieGenre>();
}
