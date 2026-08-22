from pathlib import Path
src=Path('validation/v83240-v1-sealed/v83240-preseal-freeze.py').read_text()
old="CTXV=[x.replace('A ','Một ').replace('An ','Một ') for x in CTXE]"
new="CTXV=['Một xưởng in ghi mã trục lăn và thẻ mực theo ngăn tủ.','Một phòng dây ghi bó đai và nhãn phấn theo vách.','Một lớp nhà kính ghi nhãn hạt và van phun theo ô.','Một studio gốm ghi dụng cụ tỉa và mẫu men theo bàn.','Một phòng phim ghi hộp cuộn và phiếu cảnh theo kệ.','Một phòng bánh ghi thẻ ủ bột và hộp dao vét theo trạm.','Một kho chèo ghi kẹp mái chèo và ray ghế theo giá.','Một kho phục trang ghi bao áo và nhãn đạo cụ theo tủ.','Một phòng dệt ghi khay thoi và chốt khung theo bàn.','Một lớp thiên văn ghi nắp kính và vít chân đỡ theo hộp.','Một phòng khảo sát ghi ống bản đồ và khối thước theo ngăn.','Một booth âm thanh ghi cuộn cáp và đệm tai theo tủ.','Một phòng mẫu cây ghi bao tiêu bản và giấy thấm theo kệ.','Một kho kayak ghi kẹp mái chèo và dây ghế theo bảng.','Một kho múa ghi túi giày và nhãn trang phục theo ray.','Một bàn sửa chữa ghi khay tuýp và phiếu linh kiện theo bàn.','Một phòng bếp ghi hộp dụng cụ và thẻ kho theo kệ.','Một phòng đóng sách ghi thẻ chỉ và bao dùi theo ngăn.']"
assert old in src
src=src.replace(old,new,1)
old2="TAIL_V=['Inventory note đó chỉ là background, không establish response.','Storage detail là logistical context, không behavioural evidence.','Equipment record không determine semantic route.','Filing reference chỉ supply setting, không proof mechanism.','Physical record nằm ngoài behavioural evidence.','Administrative note không decide classification.']"
new2="TAIL_V=['Chi tiết kiểm kê chỉ là bối cảnh, không chứng minh phản ứng.','Ghi chú lưu kho chỉ là hậu cảnh vận hành, không phải bằng chứng hành vi.','Dòng thiết bị không quyết định tuyến ngữ nghĩa.','Tham chiếu hồ sơ chỉ thêm bối cảnh, không chứng minh cơ chế.','Bản ghi vật lý nằm ngoài bằng chứng hành vi.','Ghi chú hành chính không quyết định phân loại.']"
assert old2 in src
src=src.replace(old2,new2,1)
exec(compile(src,'v83240-preseal-freeze-r5-adapted.py','exec'))
