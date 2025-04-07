using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Service.Interface;
using Microsoft.AspNetCore.Mvc;

namespace CinemaManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : Controller
    {
        private readonly IOrderService _orderService;

        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpGet("{orderId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<OrderDetailResponseDTO>> GetOrderDetails(int orderId)
        {
            var orderDetails = await _orderService.GetOrderDetailsAsync(orderId);
            return Ok(SuccessResponse<OrderDetailResponseDTO>.Create(orderDetails));
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<OrderResponseDTO>> CreateOrder([FromBody] OrderRequestDTO request)
        {
            var order = await _orderService.CreateOrderAsync(request);
            return CreatedAtAction(nameof(GetOrderDetails), new { orderId = order.OrderId }, SuccessResponse<OrderResponseDTO>.Create(order, "tạo đơn hàng thành công."));
        }
    }
}
