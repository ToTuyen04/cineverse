using AutoMapper;
using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;
using CinemaManagement.API.Enums;
using CinemaManagement.API.ExceptionHandler;
using CinemaManagement.API.Repository.Interface;
using CinemaManagement.API.Service.Interface;
using Microsoft.EntityFrameworkCore;
using static CinemaManagement.API.DTOs.Request.OrderRequestDTO;

namespace CinemaManagement.API.Service
{
    public class OrderDetailComboService : IOrderDetailComboService
    {
        private readonly ILogger<OrderDetailComboService> _logger;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        public OrderDetailComboService(ILogger<OrderDetailComboService> logger, IMapper mapper, IUnitOfWork unitOfWork)
        {
            _logger = logger;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        /// <summary>
        /// Thêm danh sách combo vào một order đang ở trạng thái Pending.
        /// </summary>
        /// <param name="request">Chứa thông tin về order và danh sách combo cần thêm</param>
        /// <returns>Thông tin chi tiết về các combo đã được thêm vào order</returns>
        /// <exception cref="NotFoundException">Khi không tìm thấy order hoặc combo</exception>
        /// <exception cref="InvalidOperationException">Khi order không ở trạng thái Pending</exception>
        /// <remarks>
        /// Hàm này thực hiện các bước sau:
        /// 1. Kiểm tra order có tồn tại và đang ở trạng thái Pending
        /// 2. Kiểm tra tất cả các combo trong danh sách có tồn tại
        /// 3. Map dữ liệu từ request sang entity OrderDetailCombo
        /// 4. Thêm danh sách combo vào order trong một transaction
        /// 5. Lấy thông tin chi tiết về các combo vừa thêm
        /// 6. Map dữ liệu sang DTO và trả về kết quả
        /// 
        /// Lưu ý:
        /// - Order phải ở trạng thái Pending mới có thể thêm combo
        /// - Nếu có lỗi xảy ra trong quá trình thêm, tất cả các thay đổi sẽ được rollback
        /// - Mỗi combo trong danh sách phải có ComboId, Quantity và Price hợp lệ
        /// </remarks>
        public async Task<OrderDetailComboResponseDto> AddRangeAsync(OrderDetailComboRequestDto request)
        {
            var order = await _unitOfWork.OrderRepo.GetByIdAsync(request.OrderId)
                ?? throw new NotFoundException($"Không tìm thấy order với ID: {request.OrderId}");
            Console.WriteLine("Order status sau khi get by id: " + order.OrderStatus);

            if (order.OrderStatus!.ToLower() != OrderStatus.Pending.ToString().ToLower())
            {
                throw new InvalidOperationException($"Không thể thêm combo vào order với status: {order.OrderStatus}. Chỉ cho phép thêm combo khi order đang ở trạng thái {OrderStatus.Pending.ToString()}.");
            }

            foreach (var combo in request.ComboDetails)
            {
                var existingCombo = await _unitOfWork.ComboRepo.GetByIdAsync(combo.ComboId)
                    ?? throw new NotFoundException($"Không tìm thấy combo với ID: {combo.ComboId}");
            }

            try
            {
                var orderDetailCombos = _mapper.Map<IEnumerable<OrderDetailCombo>>(request.ComboDetails)
                               .Select(odt => { odt.OrderId = request.OrderId; return odt; })
                               .ToList();

                await _unitOfWork.BeginTransactionAsync();

                await _unitOfWork.OrderDetailComboRepo.AddRangeAsync(orderDetailCombos);
                await _unitOfWork.SaveChangesAsync();
                var orderDetailCombosCreated = await _unitOfWork.OrderDetailComboRepo.GetOrderDetailCombosByOrderIdAsync(request.OrderId);
                var detailCombosResponse = _mapper.Map<IEnumerable<ComboDetailResponseDto>>(orderDetailCombosCreated).ToList();
                Console.WriteLine($"orderDetailCombosCreated count: {orderDetailCombosCreated.Count()}");
                foreach (var item in orderDetailCombosCreated)
                {
                    Console.WriteLine($"OrderDetailCombo: Id={item.OrderDetailComboId}, ComboId={item.ComboId}, Quantity={item.OrderDetailComboQuantity}, Price={item.OrderDetailComboPrice}");
                }

                Console.WriteLine($"detailCombosResponse count: {detailCombosResponse.Count}");
                foreach (var item in detailCombosResponse)
                {
                    Console.WriteLine($"ComboDetail: ComboId={item.ComboId}, ComboName={item.ComboName}, Quantity={item.Quantity}, Price={item.Price}");
                }
                await _unitOfWork.SaveChangesAsync();

                await _unitOfWork.CommitTransactionAsync();


                return new OrderDetailComboResponseDto()
                {
                    OrderId = request.OrderId,
                    comboDetails = detailCombosResponse
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                _logger.LogError(ex, "Lỗi khi thêm combo vào order {OrderId}", request.OrderId);
                throw;
            }
        }

        public async Task<OrderDetailComboResponseDto> AddCombosToOrderAysnc(int orderId, List<ComboItemRequestDTO> comboItemRequests)
        {
            if(comboItemRequests == null || !comboItemRequests.Any())
            {
                return new OrderDetailComboResponseDto
                {
                };
            }

            var OrderDetailComboRequest = new OrderDetailComboRequestDto
            {
                OrderId = orderId,
                ComboDetails = comboItemRequests.Select(c => new ComboDetailRequestDto
                {
                    ComboId = c.ComboId,
                    Quantity = c.Quantity,
                    Price = c.Price,
                }).ToList()
            };

            return await AddRangeAsync(OrderDetailComboRequest);
        }
    }
}
