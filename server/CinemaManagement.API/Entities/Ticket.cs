using System;
using System.Collections.Generic;

namespace CinemaManagement.API.Entities;

public partial class Ticket
{
    public int TicketId { get; set; }

    public int? ShowtimeId { get; set; }

    public int? ChairId { get; set; }

    public string? TicketCode { get; set; }

    public virtual ChairShowtime? ChairShowtime { get; set; }

    public virtual ICollection<OrderDetailTicket> OrderDetailTickets { get; set; } = new List<OrderDetailTicket>();

    public virtual Showtime? Showtime { get; set; }
}
