using System;
using System.Collections.Generic;

namespace CinemaManagement.API.Entities;

public partial class OrderDetailCombo
{
    public int OrderDetailComboId { get; set; }

    public int? OrderId { get; set; }

    public int? ComboId { get; set; }

    public int? OrderDetailComboQuantity { get; set; }

    public decimal? OrderDetailComboPrice { get; set; }

    public virtual Combo? Combo { get; set; }

    public virtual Order? Order { get; set; }
}
