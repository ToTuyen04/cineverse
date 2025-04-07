using System;
using System.Collections.Generic;

namespace CinemaManagement.API.Entities;

public partial class ChairShowtime
{
    public int ChairShowtimeId { get; set; }

    public int? ChairId { get; set; }

    public int? ShowtimeId { get; set; }

    public bool Available { get; set; }

    public byte[] Version { get; set; } = null!;

    public virtual Chair? Chair { get; set; }

    public virtual Showtime? Showtime { get; set; }

    public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}
