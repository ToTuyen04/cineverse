using System;
using System.Collections.Generic;

namespace CinemaManagement.API.Entities;

public partial class Chair
{
    public int ChairId { get; set; }

    public int? ChairTypeId { get; set; }

    public string? ChairName { get; set; }

    public string? ChairPosition { get; set; }

    public int? ChairRoomId { get; set; }

    public bool? ChairStatus { get; set; }

    public virtual Room? ChairRoom { get; set; }

    public virtual ICollection<ChairShowtime> ChairShowtimes { get; set; } = new List<ChairShowtime>();

    public virtual ChairType? ChairType { get; set; }
}
