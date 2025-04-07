using System;
using System.Collections.Generic;

namespace CinemaManagement.API.Entities;

public partial class OrderDetailTicket
{
    public int OrderDetailTicketId { get; set; }

    public int? OrderId { get; set; }

    public int? TicketId { get; set; }

    public decimal? OrderDetailTicketPrice { get; set; }

    public virtual Order? Order { get; set; }

    public virtual Ticket? Ticket { get; set; }
}
