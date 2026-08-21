from pathlib import Path
src=Path('validation/v83215-v1-sealed/v83215-preseal-freeze-r4.py').read_text()
src=src.replace("'Thủ tục tiếp nhận duy trì một annotation lưu file chỉ để xử lý record.'","'Thủ tục tiếp nhận duy trì một annotation lưu file riêng cho kiểm kê hồ sơ, phân luồng tài liệu và bàn giao hành chính nội bộ.'",1)
src=src.replace("'Thủ tục đặt lịch giữ một ghi chú booking cho phối hợp hành chính.'","'Thủ tục đặt lịch giữ một ghi chú booking dành cho xác nhận phòng, phối hợp người tham dự và đối chiếu lịch vận hành.'",1)
src=src.replace("preseal-freeze-r4","preseal-freeze-r5")
src=src.replace("'phase':'preseal-freeze-r4'","'phase':'preseal-freeze-r5'")
exec(compile(src,'v83215-preseal-freeze-r5-wrapper.py','exec'))
