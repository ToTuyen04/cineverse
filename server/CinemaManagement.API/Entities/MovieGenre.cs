using System;
using System.Collections.Generic;

namespace CinemaManagement.API.Entities;

public partial class MovieGenre
{
    public int MovieGenresId { get; set; }

    public int? MovieId { get; set; }

    public int? GenresId { get; set; }

    public virtual Genre? Genres { get; set; }

    public virtual Movie? Movie { get; set; }
}
