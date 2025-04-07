using System;
using System.Collections.Generic;

namespace CinemaManagement.API.Entities;

public partial class ComboDetail
{
    public int ComboDetailId { get; set; }

    public int? ComboId { get; set; }

    public int? FnbId { get; set; }

    public int? Quantity { get; set; }

    public virtual Combo? Combo { get; set; }

    public virtual Fnb? Fnb { get; set; }
}
