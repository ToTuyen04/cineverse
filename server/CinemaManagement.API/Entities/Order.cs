using System;
using System.Collections.Generic;

namespace CinemaManagement.API.Entities;

public partial class Order
{
    public int OrderId { get; set; }

    public DateTime? OrderCreateAt { get; set; }

    public int? UserId { get; set; }

    public int? VoucherId { get; set; }

    public string? OrderName { get; set; }

    public string? OrderPhone { get; set; }

    public string? OrderEmail { get; set; }

    public string? OrderStatus { get; set; }

    public virtual ICollection<OrderDetailCombo> OrderDetailCombos { get; set; } = new List<OrderDetailCombo>();

    public virtual ICollection<OrderDetailTicket> OrderDetailTickets { get; set; } = new List<OrderDetailTicket>();

    public virtual User? User { get; set; }

    public virtual Voucher? Voucher { get; set; }
}
