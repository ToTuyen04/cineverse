using System;
using System.Collections.Generic;

namespace CinemaManagement.API.Entities;

public partial class Showtime
{
    public int ShowtimeId { get; set; }

    public int? ShowtimeMovieId { get; set; }

    public DateTime? ShowtimeStartAt { get; set; }

    public int? ShowtimeCreatedBy { get; set; }

    public int? ShowtimeRoomId { get; set; }

    public bool? ShowtimeAvailable { get; set; }

    public virtual ICollection<ChairShowtime> ChairShowtimes { get; set; } = new List<ChairShowtime>();

    public virtual Movie? ShowtimeMovie { get; set; }

    public virtual Room? ShowtimeRoom { get; set; }

    public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}
