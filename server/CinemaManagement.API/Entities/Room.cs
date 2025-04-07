using System;
using System.Collections.Generic;

namespace CinemaManagement.API.Entities;

public partial class Room
{
    public int RoomId { get; set; }

    public string? RoomName { get; set; }

    public int? RoomChairAmount { get; set; }

    public int? RoomScreenTypeId { get; set; }

    public int? RoomTheaterId { get; set; }

    public virtual ICollection<Chair> Chairs { get; set; } = new List<Chair>();

    public virtual ScreenType? RoomScreenType { get; set; }

    public virtual Theater? RoomTheater { get; set; }

    public virtual ICollection<Showtime> Showtimes { get; set; } = new List<Showtime>();
}
