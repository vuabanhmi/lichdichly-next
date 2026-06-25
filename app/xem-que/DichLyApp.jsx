'use client'
import { useState, useEffect, memo } from 'react'
import UserButton from '../components/UserButton'
import SaveModal from './SaveModal'
import { autoSaveQue, getAnniversaries, addAnniversary, deleteAnniversary } from './actions'
import './dichly.css'

// ─── DATA ──────────────────────────────────────────────────────────────────────
const BAGUA={
  1:{n:'Kiền',s:'☰',e:'Thiên',lx:'Lão phu',bp:'đầu',vat:'ngựa',hanh:'Kim',mau:'trắng',pt:'Tây Bắc, Thu Đông',tt:'cương kiện, sáng tỏ, hiện, động'},
  2:{n:'Đoài',s:'☱',e:'Trạch',lx:'Út nữ',bp:'miệng',vat:'dê',hanh:'Kim',mau:'trắng',pt:'Tây, Thu',tt:'vui lòng, lời nói, thẩm mỹ'},
  3:{n:'Ly',s:'☲',e:'Hỏa',lx:'Trung nữ',bp:'mắt',vat:'phượng',hanh:'Hỏa',mau:'đỏ hồng',pt:'Nam, Hạ',tt:'sáng tỏa, nóng nảy, chiến tranh'},
  4:{n:'Chấn',s:'☳',e:'Lôi',lx:'Trưởng nam',bp:'chân/gân',vat:'rồng',hanh:'Mộc',mau:'xanh lá',pt:'Đông, Xuân',tt:'rung động, sáng tạo, hưng phấn'},
  5:{n:'Tốn',s:'☴',e:'Phong',lx:'Trưởng nữ',bp:'đùi',vat:'gà',hanh:'Mộc',mau:'xanh lá',pt:'Đông Nam, Xuân Hạ',tt:'thuận theo, dấu diếm, thu hút'},
  6:{n:'Khảm',s:'☵',e:'Thủy',lx:'Trung nam',bp:'tai',vat:'heo',hanh:'Thủy',mau:'đen xanh',pt:'Bắc, Đông',tt:'hãm sâu, hiểm trở, tình nghĩa'},
  7:{n:'Cấn',s:'☶',e:'Sơn',lx:'Út nam',bp:'lưng/tay',vat:'chó',hanh:'Thổ',mau:'vàng',pt:'Đông Bắc, Đông Xuân',tt:'ngăn giữ, tĩnh lặng, bảo thủ'},
  8:{n:'Khôn',s:'☷',e:'Địa',lx:'Lão mẫu',bp:'bụng',vat:'trâu',hanh:'Thổ',mau:'vàng',pt:'Tây Nam, Hạ Thu',tt:'nhu thuận, ẩn tàng, mềm mỏng'},
}
const TL={1:[1,1,1],2:[1,1,0],3:[1,0,1],4:[1,0,0],5:[0,1,1],6:[0,1,0],7:[0,0,1],8:[0,0,0]}
const CHI=['Tí','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi']
const HN=[
  ['Thuần Kiền','Thiên Trạch Lý','Thiên Hỏa Đồng Nhân','Thiên Lôi Vô Vọng','Thiên Phong Cấu','Thiên Thủy Tụng','Thiên Sơn Độn','Thiên Địa Bĩ'],
  ['Trạch Thiên Quải','Thuần Đoài','Trạch Hỏa Cách','Trạch Lôi Tùy','Trạch Phong Đại Quá','Trạch Thủy Khốn','Trạch Sơn Hàm','Trạch Địa Tụy'],
  ['Hỏa Thiên Đại Hữu','Hỏa Trạch Khuể','Thuần Ly','Hỏa Lôi Phệ Hạp','Hỏa Phong Đỉnh','Hỏa Thủy Vị Tế','Hỏa Sơn Lữ','Hỏa Địa Tấn'],
  ['Lôi Thiên Đại Tráng','Lôi Trạch Quy Muội','Lôi Hỏa Phong','Thuần Chấn','Lôi Phong Hằng','Lôi Thủy Giải','Lôi Sơn Tiểu Quá','Lôi Địa Dự'],
  ['Phong Thiên Tiểu Súc','Phong Trạch Trung Phu','Phong Hỏa Gia Nhân','Phong Lôi Ích','Thuần Tốn','Phong Thủy Hoán','Phong Sơn Tiệm','Phong Địa Quan'],
  ['Thủy Thiên Nhu','Thủy Trạch Tiết','Thủy Hỏa Ký Tế','Thủy Lôi Truân','Thủy Phong Tĩnh','Thuần Khảm','Thủy Sơn Kiển','Thủy Địa Tỷ'],
  ['Sơn Thiên Đại Súc','Sơn Trạch Tổn','Sơn Hỏa Bí','Sơn Lôi Di','Sơn Phong Cổ','Sơn Thủy Mông','Thuần Cấn','Sơn Địa Bác'],
  ['Địa Thiên Thái','Địa Trạch Lâm','Địa Hỏa Minh Sản','Địa Lôi Phục','Địa Phong Thăng','Địa Thủy Sư','Địa Sơn Khiêm','Thuần Khôn'],
]
const HM=[
  ['Mạnh mẽ, sáng tạo','Lễ nghĩa, tiến bước','Đoàn kết, hòa hợp','Chân thành, tự nhiên','Gặp gỡ, bất ngờ','Tranh chấp, kiện tụng','Ẩn lui, thoái bộ','Trì trệ, bế tắc'],
  ['Quyết đoán, loại bỏ','Vui vẻ, giao tiếp','Cách mạng, đổi mới','Thuận theo, ủng hộ','Gánh nặng, mạo hiểm','Khốn khó, gian nan','Cảm ứng, thu hút','Tụ hội, tập hợp'],
  ['Đại phú, hanh thông','Mâu thuẫn, xa cách','Sáng suốt, minh tuệ','Xét xử, phán quyết','Cải cách, thành tựu','Chưa hoàn thành','Lữ hành, tạm thời','Tiến bộ, thăng tiến'],
  ['Hùng tráng, mạnh mẽ','Hôn nhân lạc lối','Phong phú, thịnh đạt','Chấn động, cẩn trọng','Lâu bền, kiên định','Giải thoát, tháo gỡ','Thận trọng, nhỏ vượt','Vui mừng, phấn khởi'],
  ['Tích lũy từng giọt','Thành tín, tin cậy','Gia đình, trật tự','Lợi ích, tăng trưởng','Thuận chiều, mềm mại','Phân tán, hòa giải','Tiến dần, từng bước','Quan sát, chiêm nghiệm'],
  ['Chờ đợi, kiên nhẫn','Tiết chế, điều độ','Hoàn thành, viên mãn','Gian khổ ban đầu','Nguồn cội, gốc rễ','Hiểm trở, kiên cường','Trở ngại, khó tiến','Thân cận, đoàn kết'],
  ['Tích trữ lớn lao','Tổn thất, hi sinh','Văn vẻ, trang sức','Nuôi dưỡng, dưỡng sinh','Sửa chữa, chấn chỉnh','Khai mông, học hỏi','Dừng lại, tĩnh tại','Suy thoái, tan vỡ'],
  ['Hanh thông, thái bình','Gần gũi, dẫn dắt','Ẩn sáng, chịu đựng','Phục hồi, quay lại','Thăng tiến, vươn lên','Kỷ luật, đoàn kết','Khiêm tốn, nhún nhường','Thuận thảo, mềm mại'],
]
const KW2=[
  [0,9,12,24,43,5,32,11],
  [42,57,48,16,27,46,30,44],
  [13,37,29,20,49,63,55,34],
  [33,53,54,50,31,39,61,15],
  [8,60,36,41,56,58,52,19],
  [4,59,62,2,47,28,38,6],
  [25,40,21,26,17,3,51,22],
  [10,18,35,23,45,7,14,1],
]
const TT=[
  ['NGUYÊN HANH LỢI TRINH CHI TƯỢNG','HỔ LANG ĐANG ĐẠO CHI TƯỢNG','HIỆP LỰC ĐỒNG TÂM CHI TƯỢNG','CƯƠNG TỰ NGOẠI LAI CHI TƯỢNG','PHONG VÂN BẤT TRẮC CHI TƯỢNG','ĐẠI TIỂU BẤT HÒA CHI TƯỢNG','BẢO ẤN NAM SƠN CHI TƯỢNG','THƯỢNG HẠ TIẾM LOẠN CHI TƯỢNG'],
  ['ÍCH CHI CỰC TẮC QUYẾT CHI TƯỢNG','HÌ DẬT MI TU CHI TƯỢNG','THIÊN UYÊN HUYỀN CÁCH CHI TƯỢNG','PHẢN PHÚC BẤT ĐỊNH CHI TƯỢNG','NỘN THẢO KINH SƯƠNG CHI TƯỢNG','THỦ KỶ ĐÃI THỜI CHI TƯỢNG','NAM NỮ GIAO CẢM CHI TƯỢNG','LONG VÂN TẾ HỘI CHI TƯỢNG'],
  ['KIM NGỌC MÃN ĐƯỜNG CHI TƯỢNG','HỒ GIẢ HỔ OAI CHI TƯỢNG','MÔN HỘ BẤT NINH CHI TƯỢNG','ỦY MỊ BẤT CHẤN CHI TƯỢNG','LUYỆN DƯỢC THÀNH ĐAN CHI TƯỢNG','ƯU TRUNG VỌNG HỈ CHI TƯỢNG','Ý NHÂN TÁC GIÁ CHI TƯỢNG','LONG KIẾN TƯỜNG TRÌNH CHI TƯỢNG'],
  ['PHƯỢNG TẬP ĐĂNG SƠN CHI TƯỢNG','ÁC QUỶ VI SỦNG CHI TƯỢNG','CHÍ ĐỒNG ĐẠO HỢP CHI TƯỢNG','TRÙNG TRÙNG CHẤN KINH CHI TƯỢNG','TRƯỜNG CỬU CHI NGHĨA CHI TƯỢNG','LÔI VŨ TÁC GIẢI CHI TƯỢNG','THƯỢNG HẠ TRUÂN CHUYÊN CHI TƯỢNG','THƯỢNG HẠ DUYỆT DỊCH CHI TƯỢNG'],
  ['CẦM SẮT BẤT ĐIỆU CHI TƯỢNG','NHU TẠI NỘI NHI ĐẮC TRUNG CHI TƯỢNG','KHAI HOA KẾT TỬ CHI TƯỢNG','HỒNG HỘC XUNG TIÊU CHI TƯỢNG','ÂM DƯƠNG THĂNG GIÁNG CHI TƯỢNG','THỦY NGỘ PHONG TẮC HOÁN CHI TƯỢNG','PHÚC LỘC ĐỒNG LÂM CHI TƯỢNG','VÂN BÌNH TỤ TÁN CHI TƯỢNG'],
  ['QUÂN TỬ HOAN HỘI CHI TƯỢNG','TRẠCH THƯỢNG THỦY CHI TƯỢNG','HANH TIỂU GIÁ CHI TƯỢNG','TIỀN HUNG HẬU KIẾT CHI TƯỢNG','KIỀN KHÔN SẮT PHỐI CHI TƯỢNG','KHỔ TẬN CAM LAI CHI TƯỢNG','BẤT NĂNG TIẾN DÃ CHI TƯỢNG','KHỬ XÀM NHIỆM HIỀN CHI TƯỢNG'],
  ['ĐỒNG LOẠI HOAN HỘI CHI TƯỢNG','PHÒNG NHÂN ÂM TOÁN CHI TƯỢNG','QUANG MINH THÔNG ĐẠT CHI TƯỢNG','PHI LONG NHẬP UYÊN CHI TƯỢNG','ÂM HẠI TƯƠNG LIÊN CHI TƯỢNG','THIÊN VÕN TỨ TRƯƠNG CHI TƯỢNG','THỦ CƯU ĐÃI THỜI CHI TƯỢNG','LỤC THÂN BẰNG THÁNG CHI TƯỢNG'],
  ['THIÊN ĐỊA HÒA XỨ VẬT CHI TƯỢNG','QUÂN TỬ GIÁO DÂN CHI TƯỢNG','KINH CỮ MẪN ĐỒ CHI TƯỢNG','SƠN NGOÀI THANH SƠN CHI TƯỢNG','PHỦ GIAO TRỤ THƯỢNG CHI TƯỢNG','SĨ CHÚNG ỦNG TÒNG CHI TƯỢNG','THƯỢNG HẠ MẮC ỨNG LUNG CHI TƯỢNG','NHU THUẬN LỢI TRINH CHI TƯỢNG'],
]
const BT=[
  ['Hiện, dương trần, chường mặt, công khai, lành lặn, xuất hiện, hiển hiện, bản chất, cởi mở, hăng hái, thật tình, thực tế, tích cực, ra mặt, cường thịnh, vững chắc, khỏe mạnh, hùng dũng, thô cứng, tài năng, mập, dai nhách, võ, rộng, thế công, dữ, thô bạo, nhanh chóng, cương trực, phi thường, công chức, giàu, dày, nhà ngói, tiền, khôn, hăng hái, liên lạc, nối kết, sáng sủa, tươi sáng, hóa thành, thanh niên, đàn ông.','Lễ độ, lễ phép, phép tắc, lễ kính, nghi lễ, khuôn phép, cung kính, lễ trọng, chùa, nhà thờ, thánh đường, tạ ơn, ơn nghĩa, kính phục, kính trọng. Lộ hành, hành trình, đường trường, đường thiên lý, dai dẳng, chính sách, luật pháp, pháp lý, quy tắc, quy luật, nội quy, khuôn phép, tiến bộ, tiến hành. Chặn đường, đón đường, giày, dép, xe cộ, dẫm lên.','Một lòng một dạ, đồng lòng, đồng tình, thỏa lòng, hả dạ, như ý, đồng hương. Chung tình, chung thủy, chung sức, chung lòng, trước sau như một. Gần gũi, thân thiện, thân tình. Giống nhau, như nhau, cá mè một lứa, anh em, bạn thân, song đôi, sánh đôi, song sanh, ngang vai vế. Cùng loại, cùng loài, đồng cảnh ngộ, đồng bệnh tương lân, nguyên chất, đồng nhất, nhất trí, bà con, xóm giềng.','Thiên tai, tai bay vạ gió, phạm lỗi bậy bạ, làm càng, làm liều, liều mạng, không lề lối, không quy củ, không phép tắc, ý mạnh hiếp yếu, luật rừng đạo loạn, bạc hành, hành hung, côn đồ, thô bạo, xâm lăng, xâm lược, chống đối, chống trả, không chịu, tránh né, tuyệt vọng, đi không được, làm không xong, im lặng chờ thời, ngược chiều, giặc ngoại xâm, vô lý.','Giao hợp, giao hòa, bang giao, giao kết, giao hẹn, giao kèo, giao ước, trao đổi, trao tặng, ký kết hợp đồng, kết dính, câu kết, hẹn hò, giao lưu, gặp gỡ thình lình, móc nối, móc ngoặc, gặp nhau.','Luận bàn, bàn cãi, tranh luận, lý lẽ, bàn tính, cãi vã, kiện cáo, kiện tụng, luật sư, thẩm phán, gây nhau, hiềm khích, tị hiềm, va chạm, tranh giành, hơn thua, khắc khẩu, tụng kinh, tụng niệm, la ó, không đồng ý, lầm bầm, xì xào, tranh chấp, biện hộ, bất hòa, rất hăng.','Dưới thấp, dưới đáy, sàn nhà, độn thổ, che lấp, che đậy, bao che, lấn vào giữa, lẩn tránh, trấn né, tuột xuống, tuột dốc, hướng hạ, cúi xuống, lặn xuống, xuống dốc, suy sụp, phía sau.','Xa cách vạn dặm, nghìn trùng xa cách, giãn cách, cách trở, gián đoạn, vách ngăn, vách tường, hàng rào, rào cản, nghịch lý, xe đi ngược chiều, biên giới, biên cương, cuối tuần, cuối ngày, giao thừa, giờ Tý.'],
  ['Rối ren, bối rối, rối rắm, rắc rối, rối như tơ vò, chỉ rối, tóc rối, rối loạn, rối tung, gỡ rối, ổ nhện.','Lồng đèn, bánh trung thu, cái lưỡi, cái miệng, lá phổi, thiếu nữ, áo đầm, bùn non, vật đẹp, ca sĩ, nghệ sĩ, nghệ nhân.','Thay đổi, cải đổi, đổi chủ, đổi mới, cách tân, cải tổ, canh tân, trao đổi, cải tiến, hoán cải, thay lòng đổi dạ, cải tạo, thay trắng đổi đen, phong cách.','Theo thời, được thời, đắc thời, thuận thời, kịp thời, được thế, thuận thể, thắng thế, thời vụ, thời đại, thời lịnh, thời kỳ, thời tiết, thời trang, hợp thời, tùy thời.','To quá, quá mức, quá lố, quá trớn, lỡ trớn, mập quá, ốm quá, nhỏ quá, lớn quá, vượt quá, qua đò, qua phà, quá đà, qua sông, cồng kềnh, lão tướng.','Nguy lo, nguy cấp, chí nguy, nguy hiểm, nguy khốn, nguy kịch, nguy nan, giải nguy, cứu nguy, lo lắng, lo sợ, lo rầu, lo toan, lo lót.','Dịu dàng, nhẹ nhàng, nhỏ nhẹ, vuốt ve, mơn trớn, nâng niu, chiều chuộng, mỏng manh, thánh thót, cảm tình, cảm ứng, cảm xúc, nhạy cảm, cảm động.','Tụ họp, tề tụ, chầu về, tụ lại, kết tụ, gom lại, dồn đống, đóng cát, đông đảo, đông nghẹt, chùm nho, chùm khế, chùm nhãn.'],
  ['Đại hữu là nhiều thứ cả có, có nhiều, đại phú gia, tiền bạc dồi dào, lắm của, dư tiền, dư thừa, mập, dồi dào, sung túc, sung mãn, mãn nguyện, thỏa chí.','Súng đạn, cung tên, thuốc nổ, kiếm cung, bạo lực, ép dầu, ép mỡ, ép duyên, hù dọa, dọa nạt, hăm he, giả bộ, giả dối.','Mặt trời, cái gương, soi bóng, sáng sủa, buổi trưa, rõ sáng, thật thà, chất phác, thông minh, chân thật, vô tư, nắng.','Cắn hợp, hôn nhân, cào, cấu, bám víu, dày xé, hành hạ, đay nghiến, cối xay, nhai nuốt, ăn uống, phỏng vấn, tra hỏi.','Ý định, hy vọng, ý muốn, thề non hẹn biển, vững tâm, an tâm, yên lòng, cầu nguyện, hôn ước, đỉnh.','Dở dang, lỡ dở, bỏ dở, đổ vỡ, xiêu vẹo, liêu xiêu, ngả nghiêng, chênh lệch, chênh vênh, chông chênh, lưng chừng, không quyết đoán.','Lang thang, rày đây mai đó, du mục, giang hồ, lãng tử, tha hương cầu thực, lơ đãng, lẩn thẩn, hời hợt, không suy nghĩ sâu.','Tấn là hiển hiện, rõ ràng, minh bạch, đắc lợi, tiến triển, được mùa, tiến tới, tiến công, được lợi, trưng bày, bày biện.'],
  ['Vươn lên, vượt lên, ngóc lên, chồi lên, ngẩng lên, đi lên, leo lên, tiến lên, lên trên, mọc lên, cao lên, nhắc lên.','Quỷ sứ, quỷ ma, quỷ dữ, quỷ quái, ma lực, yêu tinh, yêu nữ, người yêu, quái gở, ma quái, ma men, ma lanh, khôn lỏi.','Hòa mỹ, hòa đồng, hòa tan, hòa bình, hợp đoàn, hợp khối, pha trộn, trộn lẫn, hợp nhất, ly hợp, ăn khớp, thông đồng.','Khởi động, bắt đầu, khai nguyên, khởi đầu, điểm xuất phát, phát động, khởi sắc, khởi công, khởi hành.','Vợ chồng, cha con, mẹ con, thâm tình, thâm giao, cố tri, lưu niệm, hoài niệm, bạn cũ, ký ức.','Nơi nơi, khắp nơi, mọi nơi, mọi lúc, mọi miền mọi nẻo, mọi ngả, rộng khắp, vùng miền, trải đều, lan tỏa.','Tiểu quá, nhỏ nhỏ, nhỏ con, trẻ con, còn nhỏ, còn trẻ, trẻ thơ, con nít, nhỏ nhẹ, chuyện nhỏ, bạc nhỏ.','Dự phòng, phòng bị, phòng hờ, phòng thân, phòng thủ, canh phòng, canh chừng, canh giữ, phòng xa, chích ngừa.'],
  ['Oán giận, oán hờn, oán ghét, oán hận, oán thù, ân oán, than van, tả oán. Sầu hận, sầu tình, cô đơn, cô độc.','Trung thực, tin tưởng, cả tin, tin cậy, tin yêu, niềm tin, đức tin, trọn tin, tin nhau, tín nhiệm.','Sinh nở, nhà bảo sinh, sinh đẻ, đơm hoa kết trái, thai nhi, hài nhi, trẻ thơ, bông búp, nở hoa.','Bay nhảy, chim bay, bay biến, hướng lên, bay lên, vọt lên, tiến lên. Quyền lợi, ích lợi, lợi ích, lợi nhuận.','Theo tới, theo lui, chịu theo, thuận theo, thuận nhập, gia nhập, nhập bọn, nhập lũ, che đậy, đeo bám.','Chia lìa, chia rẽ, phân chia, phân kỳ, phân biệt, rã rời, rã đám, tan rã, ly tán, ly biệt.','Tuần tự, lần lượt, thứ tự, trật tự, nề nếp, ngăn nắp, thứ bậc, tôn ti. Chậm chạp, chậm như rùa.','Trải qua, kinh qua, ngang qua, lướt qua, trôi qua, từng trải, lội đời, sành sỏi, sành điệu.'],
  ['Chờ đợi, chờ thời, sự tích hòn vọng phu, chờ lệnh, chầu chờ, trông chờ, ngóng chờ, ráng chờ.','Biên độ, tọa độ, góc độ, biên cương, ranh giới, hàng rào, giới hạn, hạn định, đình chỉ.','Hiện hợp, hiện thời, đắc thế, hiện hữu, hiện thực, hiện có, đoàn kết, khéo có, đúng, đắc thế.','Gian nan, cực khổ, gian nguy, gian lao, lận đận, cơ cực, khổ sở, khổ ải, trầm luân, bó rọ.','Miền xa xôi, trũng sâu, vực sâu, đáy trũng, thung lũng, đáy ao, đáy hồ, đáy biển, đáy sông.','Nước suối, nước sông, nguồn nước, ao hồ, nước ngầm, nước giếng, nước mưa, biển cả, sông rạch.','Trắc trở, trăn trở, trở ngại, vướng, chướng ngại vật, điện, điện trở, lực cản, vật cản, đắp mô.','Số một, trụ cột, độc nhất, độc chiêu, độc đoán, độc tài, độc lập, cô độc, đơn độc, độc thân.'],
  ['Tích diện, chứa đựng, chứa nhiều, cái kho, bình ắc quy, tích trữ, tích dưỡng, tích lũy, dung tích.','Tiêu hao, hao tổn, hư hao, hao bớt, hao tài, tốn của, đại hao, tiểu hao, hao quá sức, hao mòn.','Trang điểm, tô son, điểm trang, cắt tóc, uốn tóc, kẹp tóc, thời trang, làm móng, thẩm mỹ viện.','Động tĩnh, lao động, lao công, lao lực, làm việc, tay làm hàm nhai. Ăn uống, ngủ, nghỉ ngơi.','Biến cố, sự biến, biến loạn, vật cùng tắc biến, biến tất thông, đạo cực biến.','Si tình, si dại, si cuồng, si mê, cây si, lụy tình, say đắm, cắm đuôi, đắm chìm, quỳ lạy.','Kết cuộc, chấm dứt, cuối cùng, kết thúc, ngưng, hết, dừng, thôi, chần chừ, chờ đợi, chậm chạp.','Tiêu điều, tiêu tàn, tiêu ba, tiêu phí, tiêu tùng, tiêu sơ, tiêu hao, tiêu tổn, mồ mả, nghĩa địa.'],
  ['Thông minh, thông thái, thông suốt, am hiểu, thông hiểu, hanh thông, am tường, thấu suốt, biết tin.','Lớn lên, tướng thành, phóng to, phình ra, cấp lớn, cấp cao, đường lớn, đại lộ, người lớn, vĩ đại.','Gai góc, đạp gai, đạp nhọn, đạp miểng, vật nhọn, vết trầy, vết sướt, vết thương, đau khổ, đau lòng.','Tắt nhật lại phục chờ đợi bày ngày sẽ trở lại. Nồi sinh, hồi sinh, phục sinh, lai sinh, còn sống.','Cao bay xa chạy, tầu về là thượng sách, bóng bóng bay, bay bổng bay cao, thời giờ thấm thoát.','Chúng trợ, trợ giúp, ứng hộ, cứu trợ, bảo trợ, cứu tế, giúp đỡ, giúp sức, giúp công, hoan hô.','Khiêm tốn, khiêm ái, khiêm cung, khiêm nhường, nhường nhịn, e ngại, e thẹn, e ấp, khép nép.','Ẩn, âm cảnh, ẩn lút, ẩn tránh, thấp thoáng, u ẩn, buồn chán, giả dối, đau buồn, bí mật, trong.'],
]
const GIO12=[
  {chi:'Tý',h:23,label:'23–1h'},{chi:'Sửu',h:1,label:'1–3h'},
  {chi:'Dần',h:3,label:'3–5h'},{chi:'Mão',h:5,label:'5–7h'},
  {chi:'Thìn',h:7,label:'7–9h'},{chi:'Tỵ',h:9,label:'9–11h'},
  {chi:'Ngọ',h:11,label:'11–13h'},{chi:'Mùi',h:13,label:'13–15h'},
  {chi:'Thân',h:15,label:'15–17h'},{chi:'Dậu',h:17,label:'17–19h'},
  {chi:'Tuất',h:19,label:'19–21h'},{chi:'Hợi',h:21,label:'21–23h'},
]
const SUITS=[{sym:'♠',color:'black'},{sym:'♥',color:'red'},{sym:'♦',color:'red'},{sym:'♣',color:'black'}]
const VALS=['A','2','3','4','5','6','7','8','9','10','J','Q','K']
const FIXED_EVENTS=[
  {name:'Giỗ sư tổ Dịch Lý Sĩ Xuân Phong Nguyễn Văn Mì',lm:3,ld:10,fixed:true},
  {name:'Ngày giỗ ông Hoàng Mười',lm:10,ld:10,fixed:true},
]

// ─── MODULE STATE ──────────────────────────────────────────────────────────────
let liveMode=true, currentView='que', lastHChi=-1
let calYear=0, calMonth=0, calYearBase=0, calUserNav=false
let calEvents=[]
let themeMode='auto'
let _uid=0
let bqTab='bai'
let bqDeck=[], bqDrawn={left:null,right:null}, bqStep=1
let bqHistory=[], bqDrawCount=0
let bsxHistory=[], sdtHistory=[]

// ─── UTILS ─────────────────────────────────────────────────────────────────────
function INT(d){return Math.trunc(d)}
function pad(n){return String(n).padStart(2,'0')}
function jdFromDate(dd,mm,yy){
  var a=INT((14-mm)/12),y=yy+4800-a,m=mm+12*a-3
  var jd=dd+INT((153*m+2)/5)+365*y+INT(y/4)-INT(y/100)+INT(y/400)-32045
  if(jd<2299161)jd=dd+INT((153*m+2)/5)+365*y+INT(y/4)-32083
  return jd
}
function newMoon(k){
  var T=k/1236.85,T2=T*T,T3=T2*T,dr=Math.PI/180
  var Jd1=2415020.75933+29.53058868*k+0.0001178*T2-0.000000155*T3+0.00033*Math.sin((166.56+132.87*T-0.009173*T2)*dr)
  var M=359.2242+29.10535608*k-0.0000333*T2-0.00000347*T3
  var Mpr=306.0253+385.81691806*k+0.0107306*T2+0.00001236*T3
  var F=21.2964+390.67050646*k-0.0016528*T2-0.00000239*T3
  var C1=(0.1734-0.000393*T)*Math.sin(M*dr)+0.0021*Math.sin(2*dr*M)
    -0.4068*Math.sin(Mpr*dr)+0.0161*Math.sin(dr*2*Mpr)-0.0004*Math.sin(dr*3*Mpr)
    +0.0104*Math.sin(dr*2*F)-0.0051*Math.sin(dr*(M+Mpr))-0.0074*Math.sin(dr*(M-Mpr))
    +0.0004*Math.sin(dr*(2*F+M))-0.0004*Math.sin(dr*(2*F-M))-0.0006*Math.sin(dr*(2*F+Mpr))
    +0.0010*Math.sin(dr*(2*F-Mpr))+0.0005*Math.sin(dr*(M+2*Mpr))
  var deltat=T>=-11?(-0.000278+0.000265*T+0.000262*T2):(0.001+0.000839*T+0.0002261*T2-0.00000845*T3-0.000000081*T*T3)
  return INT(Jd1+C1-deltat+0.5+7/24)
}
function sunLongitude(jdn){
  var T=(jdn-2451545.5-7/24)/36525,T2=T*T,dr=Math.PI/180
  var M=357.5291+35999.0503*T-0.0001559*T2-0.00000048*T*T2
  var L0=280.46646+36000.76983*T+0.0003032*T2
  var DL=(1.9146-0.004817*T-0.000014*T2)*Math.sin(dr*M)+(0.019993-0.000101*T)*Math.sin(dr*2*M)+0.00029*Math.sin(dr*3*M)
  var L=(L0+DL)%360; if(L<0)L+=360
  return INT(L/30)
}
function getLeapMonthOffset(a11){
  var k=INT((a11-2415021.076998695)/29.530588853+0.5)
  var last=0,i=1,arc=sunLongitude(newMoon(k+i))
  while(arc!==last&&i<14){last=arc;i++;arc=sunLongitude(newMoon(k+i))}
  return i-1
}
function getLunarYear11(yy){
  var off=jdFromDate(31,12,yy)-2415021.076998695
  var k=INT(off/29.530588853)
  var nm=newMoon(k)
  if(sunLongitude(nm)>=9)nm=newMoon(k-1)
  return nm
}
function toLunar(gY,gM,gD){
  var dayNumber=jdFromDate(gD,gM,gY)
  var k=INT((dayNumber-2415021.076998695)/29.530588853)
  var monthStart=newMoon(k+1)
  if(monthStart>dayNumber)monthStart=newMoon(k)
  var a11=getLunarYear11(gM>=11?gY:gY-1)
  var b11=getLunarYear11(gM>=11?gY+1:gY)
  var lunarMonth=INT((monthStart-a11)/29)+11
  if(b11-a11>365){
    var leapOff=getLeapMonthOffset(a11)
    if(lunarMonth>=leapOff)lunarMonth--
  }
  if(lunarMonth>12)lunarMonth-=12
  if(lunarMonth<1)lunarMonth+=12
  var lunarDay=dayNumber-monthStart+1
  var lunarYear=(lunarMonth>=11&&gM<3)?gY-1:gY
  var canArr=['Canh','Tân','Nhâm','Quý','Giáp','Ất','Bính','Đinh','Mậu','Kỷ']
  var chiArr=['Thân','Dậu','Tuất','Hợi','Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi']
  var yn=canArr[lunarYear%10]+' '+chiArr[lunarYear%12]
  var yc=((lunarYear+9)%12)||12
  return{ld:lunarDay,lm:lunarMonth,ly:lunarYear,yc,yn}
}
function getVN(){
  const n=new Date()
  const v=new Date(n.toLocaleString('en-US',{timeZone:'Asia/Ho_Chi_Minh'}))
  return{Y:v.getFullYear(),M:v.getMonth()+1,D:v.getDate(),h:v.getHours(),m:v.getMinutes(),s:v.getSeconds()}
}
function getHChi(h){if(h===23||h===0)return 1;return Math.floor((h+1)/2)+1}
function l2t(a,b,c){for(let t=1;t<=8;t++){const[x,y,z]=TL[t];if(x===a&&y===b&&z===c)return t}return 1}
function calc(vn){
  const lu=toLunar(vn.Y,vn.M,vn.D)
  if(!lu)return null
  const yc=lu.yc,m=lu.lm,d=lu.ld,hc=getHChi(vn.h)
  const s3=yc+m+d,s4=s3+hc
  let up=s3%8;if(!up)up=8
  let lo=s4%8;if(!lo)lo=8
  let hao=s4%6;if(!hao)hao=6
  const L6=[...TL[lo],...TL[up]]
  const hoL=l2t(L6[1],L6[2],L6[3])
  const hoU=l2t(L6[2],L6[3],L6[4])
  const B6=[...L6];B6[hao-1]=B6[hao-1]===1?0:1
  const bL=l2t(B6[0],B6[1],B6[2])
  const bU=l2t(B6[3],B6[4],B6[5])
  return{lu,yc,m,d,hc,s3,s4,up,lo,hao,L6,hoU,hoL,bU,bL,B6}
}
function hexUnicode(l6){
  const lo=l2t(l6[0],l6[1],l6[2]),up=l2t(l6[3],l6[4],l6[5])
  return String.fromCodePoint(0x4DC0+KW2[up-1][lo-1])
}
function linesHtml(l6,mov){
  let h=''
  for(let i=5;i>=0;i--){
    const isM=mov===i+1,c=isM?'mc':'nc'
    const mark=isM?'<span class="hao-mark">✦</span>':''
    h+=l6[i]===1
      ?`<div class="lrow"><div class="line-yang ${c}"></div>${mark}</div>`
      :`<div class="lrow"><div class="line-yin ${c}"></div>${mark}</div>`
  }
  return h
}
function btSection(up,lo){
  const bt=BT[up-1][lo-1]
  if(!bt)return''
  const id='bt'+(++_uid)
  return`<div class="hbt-wrap" data-btid="${id}"><div class="hbt-toggle" data-toggle="${id}"><span class="hbt-lbl">BIẾN THÔNG</span><span class="hbt-arr" id="arr_${id}">▼</span></div><div class="hbt-body" id="${id}">${bt}</div></div>`
}
function haoInfo(hao,up,lo){
  const trig=hao<=3?lo:up,bg=BAGUA[trig],viTri=hao<=3?'Hạ quái':'Thượng quái'
  return`● Hào ${hao} động · ${viTri}: <strong>${bg.e} ${bg.s} (${bg.n})</strong><br>└ ${bg.lx} · ${bg.bp} · ${bg.vat} · <span style="color:var(--gold)">${bg.hanh} · ${bg.mau}</span> · ${bg.pt}<br><span style="font-size:11px;color:var(--text2)">└ ${bg.tt}</span>`
}
function haoInfoHo(hao,hoU,hoL){
  const trig=hao<=3?hoL:hoU,bg=BAGUA[trig],viTri=hao<=3?'Hậu tượng':'Tiên tượng'
  return`● Hào ${hao} động · ${viTri}: <strong>${bg.e} ${bg.s} (${bg.n})</strong><br>└ ${bg.lx} · ${bg.bp} · ${bg.vat} · <span style="color:var(--gold)">${bg.hanh} · ${bg.mau}</span> · ${bg.pt}<br><span style="font-size:11px;color:var(--text2)">└ ${bg.tt}</span>`
}
function card(label,up,lo,l6,mov,extra){
  const nm=HN[up-1][lo-1],me=HM[up-1][lo-1]
  const bu=BAGUA[up],bl=BAGUA[lo],hexU=hexUnicode(l6)
  return`<div class="hcard"><div class="hlabel">${label}</div><div class="hbody"><div class="hinfo"><div class="hname">${nm}</div><div class="htrig">${bu.e} ${bu.s} trên · ${bl.e} ${bl.s} dưới</div><div class="hmean">${me}</div><div class="htt">${TT[up-1][lo-1]}</div>${extra?`<div class="hextra">${extra}</div>`:''}</div><div class="lines"><div style="font-size:36px;color:var(--gold);text-align:center;margin-bottom:6px;line-height:1">${hexU}</div>${linesHtml(l6,mov)}</div></div>${btSection(up,lo)}</div>`
}
function sumMod8(nums){let s=nums.reduce((a,b)=>a+b,0);let r=s%8;return r===0?8:r}
function sumMod6(nums){let s=nums.reduce((a,b)=>a+b,0);let r=s%6;return r===0?6:r}
function allEvents(){return[...FIXED_EVENTS,...calEvents]}

// ─── DOM FUNCTIONS ─────────────────────────────────────────────────────────────
function _autoTheme(){const h=new Date().getHours();return h>=6&&h<18?'light':'dark'}
function applyTheme(mode){
  themeMode=mode
  const t=mode==='auto'?_autoTheme():mode
  document.documentElement.setAttribute('data-theme',t)
  localStorage.setItem('theme-mode',mode)
  const btn=document.getElementById('theme-btn')
  if(btn){btn.textContent=mode==='auto'?'⏰':(mode==='light'?'☀':'☽');btn.title=mode==='auto'?'Tự động (6h–18h sáng, còn lại tối)':'Nhấn để đổi chế độ'}
}
function toggleTheme(){applyTheme(themeMode==='auto'?'light':(themeMode==='light'?'dark':'auto'))}
function initThemeBtn(){applyTheme(localStorage.getItem('theme-mode')||'auto')}
function loadCalEvents(){try{calEvents=JSON.parse(localStorage.getItem('dichlyvn-events')||'[]')}catch(e){calEvents=[]}}
function saveCalEvents(){localStorage.setItem('dichlyvn-events',JSON.stringify(calEvents))}
function calHideOverlays(){
  document.getElementById('cal-month-picker').style.display='none'
  document.getElementById('cal-year-picker').style.display='none'
  document.getElementById('cal-head-month').classList.remove('active')
  document.getElementById('cal-head-year').classList.remove('active')
}
function calNavMonth(dir){calUserNav=true;calMonth+=dir;if(calMonth>12){calMonth=1;calYear++}if(calMonth<1){calMonth=12;calYear--}calHideOverlays();renderCal()}
function calNavYear(dir){calUserNav=true;calYear+=dir;calHideOverlays();renderCal()}
function calToggleMonth(){
  const CAL_MS=['T.1','T.2','T.3','T.4','T.5','T.6','T.7','T.8','T.9','T.10','T.11','T.12']
  const mp=document.getElementById('cal-month-picker'),yp=document.getElementById('cal-year-picker')
  const hm=document.getElementById('cal-head-month'),hy=document.getElementById('cal-head-year')
  const open=mp.style.display==='none'
  yp.style.display='none';hy.classList.remove('active')
  if(open){let h='<div class="cal-month-grid">';for(let i=0;i<12;i++)h+=`<div class="cal-m-item${i+1===calMonth?' sel':''}" onclick="window._w.calPickMonth(${i+1})">${CAL_MS[i]}</div>`;h+='</div>';mp.innerHTML=h;mp.style.display='block';hm.classList.add('active')}
  else{mp.style.display='none';hm.classList.remove('active')}
}
function calPickMonth(m){calUserNav=true;calMonth=m;calHideOverlays();renderCal()}
function calToggleYear(){
  const yp=document.getElementById('cal-year-picker'),mp=document.getElementById('cal-month-picker')
  const hy=document.getElementById('cal-head-year'),hm=document.getElementById('cal-head-month')
  const open=yp.style.display==='none'
  mp.style.display='none';hm.classList.remove('active')
  if(open){calYearBase=Math.floor(calYear/20)*20;renderYearPicker();yp.style.display='block';hy.classList.add('active')}
  else{yp.style.display='none';hy.classList.remove('active')}
}
function calNavYearGroup(dir){calYearBase+=dir*20;renderYearPicker()}
function renderYearPicker(){
  const cy=new Date().getFullYear()
  let h=`<div class="cal-year-nav"><button class="cal-nav-btn" onclick="window._w.calNavYearGroup(-1)">‹</button><span class="cal-year-range">${calYearBase} – ${calYearBase+19}</span><button class="cal-nav-btn" onclick="window._w.calNavYearGroup(1)">›</button></div><div class="cal-year-grid">`
  for(let i=0;i<20;i++){const y=calYearBase+i;const c='cal-y-item'+(y===calYear?' sel':'')+(y===cy?' cur-year':'');h+=`<div class="${c}" onclick="window._w.calPickYear(${y})">${y}</div>`}
  h+='</div>'
  document.getElementById('cal-year-picker').innerHTML=h
}
function calPickYear(y){calUserNav=true;calYear=y;calHideOverlays();renderCal()}
function renderCal(){
  const CAL_MN=['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12']
  document.getElementById('cal-head-month').textContent=CAL_MN[calMonth-1]
  document.getElementById('cal-head-year').textContent=calYear
  const td=new Date(),tY=td.getFullYear(),tM=td.getMonth()+1,tD=td.getDate()
  const sv=document.getElementById('pick-date').value
  let sY=0,sM=0,sD=0;if(sv){[sY,sM,sD]=sv.split('-').map(Number)}
  const firstDow=new Date(calYear,calMonth-1,1).getDay(),dim=new Date(calYear,calMonth,0).getDate()
  let h=''
  for(let i=0;i<firstDow;i++)h+='<div class="cal-day empty"></div>'
  for(let d=1;d<=dim;d++){
    let c='cal-day'
    if(d===tD&&calMonth===tM&&calYear===tY)c+=' today'
    if(d===sD&&calMonth===sM&&calYear===sY)c+=' selected'
    const lu=toLunar(calYear,calMonth,d)
    const ldTxt=lu?(lu.ld===1?`${lu.ld}/${lu.lm}`:lu.ld):''
    const lunarCls='cal-lunar'+(lu&&lu.ld===1?' lm-new':'')
    const hasEvt=lu&&allEvents().some(e=>e.lm===lu.lm&&e.ld===lu.ld)
    if(hasEvt)c+=' has-evt'
    h+=`<div class="${c}" onclick="window._w.calSelectDay(${d})"><span class="cal-solar">${d}</span><span class="${lunarCls}">${ldTxt}</span><span class="cal-dot"></span></div>`
  }
  document.getElementById('cal-grid').innerHTML=h
}
function calSelectDay(d){
  calUserNav=false
  document.getElementById('pick-date').value=`${calYear}-${pad(calMonth)}-${pad(d)}`
  renderCal()
  const lu=toLunar(calYear,calMonth,d);showDayEvents(lu);onPickChange()
}
function calSyncDisplay(){
  if(calUserNav)return
  const v=document.getElementById('pick-date').value
  if(!v)return
  const[y,m]=v.split('-').map(Number);calYear=y;calMonth=m;renderCal()
}
function showDayEvents(lu){
  const di=document.getElementById('cal-day-info')
  if(!lu){di.classList.remove('show');return}
  const evts=allEvents().filter(e=>e.lm===lu.lm&&e.ld===lu.ld)
  if(!evts.length){di.classList.remove('show');return}
  di.innerHTML='<div class="cal-day-info-lbl">NGÀY KỶ NIỆM</div>'+evts.map(e=>`<div class="cal-day-info-item"><span class="cal-day-info-dot"></span>${e.name}</div>`).join('')
  di.classList.add('show')
}
function calToggleEvtPanel(){
  const p=document.getElementById('cal-evt-panel'),open=!p.classList.contains('show')
  p.classList.toggle('show',open)
  document.getElementById('cal-evt-toggle').textContent=open?'✦ Đóng':'✦ Ngày kỷ niệm'
  if(open){renderEvtList();initEvtForm()}
}
function renderEvtList(){
  const el=document.getElementById('cal-evt-list')
  const sorted=[...allEvents()].sort((a,b)=>a.lm!==b.lm?a.lm-b.lm:a.ld-b.ld)
  if(!sorted.length){el.innerHTML='<div class="cal-evt-empty">Chưa có ngày nào được lưu</div>';return}
  el.innerHTML=sorted.map(e=>{
    const del=e.fixed?`<span style="font-size:10px;color:var(--text3);letter-spacing:1px">cố định</span>`:`<button class="cal-evt-del" onclick="window._w.calDeleteEvent('${e.id||calEvents.indexOf(e)}')" title="Xóa">✕</button>`
    return`<div class="cal-evt-item"><div class="cal-evt-info"><div class="cal-evt-name">${e.name}</div><div class="cal-evt-date">Ngày ${e.ld} tháng ${e.lm} âm lịch</div></div><div class="cal-evt-del-wrap">${del}</div></div>`
  }).join('')
}
function initEvtForm(){
  const lmSel=document.getElementById('evt-lm'),ldSel=document.getElementById('evt-ld')
  if(!lmSel.options.length){for(let i=1;i<=12;i++)lmSel.innerHTML+=`<option value="${i}">Tháng ${i}</option>`;for(let i=1;i<=30;i++)ldSel.innerHTML+=`<option value="${i}">Ngày ${i}</option>`}
  const sv=document.getElementById('pick-date').value
  if(sv&&!liveMode){const[y,m,d]=sv.split('-').map(Number);const lu=toLunar(y,m,d);if(lu){lmSel.value=lu.lm;ldSel.value=lu.ld}}
}
function calAddEvent(){
  const name=document.getElementById('evt-name').value.trim()
  const lm=parseInt(document.getElementById('evt-lm').value),ld=parseInt(document.getElementById('evt-ld').value)
  if(!name){document.getElementById('evt-name').focus();return}
  if(window.__dichly_addEvt){window.__dichly_addEvt(name,lm,ld);return}
  window.location.href='/login'
}
function calDeleteEvent(idOrIdx){
  if(window.__dichly_delEvt){window.__dichly_delEvt(idOrIdx);return}
  const idx=parseInt(idOrIdx);calEvents.splice(idx,1);saveCalEvents();renderEvtList();renderCal()
}
function getPickerVN(){
  const dv=document.getElementById('pick-date').value,hv=parseInt(document.getElementById('pick-time').value)
  if(!dv||isNaN(hv))return getVN()
  const[Y,M,D]=dv.split('-').map(Number);return{Y,M,D,h:hv,m:0,s:0}
}
function initPicker(){
  calUserNav=false
  const vn=getVN()
  document.getElementById('pick-date').value=`${vn.Y}-${pad(vn.M)}-${pad(vn.D)}`
  calSyncDisplay()
  const hmap=[{start:23,end:1,val:23},{start:1,end:3,val:1},{start:3,end:5,val:3},{start:5,end:7,val:5},{start:7,end:9,val:7},{start:9,end:11,val:9},{start:11,end:13,val:11},{start:13,end:15,val:13},{start:15,end:17,val:15},{start:17,end:19,val:17},{start:19,end:21,val:19},{start:21,end:23,val:21}]
  let sel=23;const h=vn.h
  if(h===23||h===0)sel=23;else{const m=hmap.find(x=>h>=x.start&&h<x.end);if(m)sel=m.val}
  document.getElementById('pick-time').value=sel
}
function onPickChange(){liveMode=false;doCalc(true)}
function goNow(){
  liveMode=true;initPicker()
  if(currentView==='boc')switchView('que')
  doCalc()
  setTimeout(()=>{const el=document.getElementById('view-que');if(el)el.scrollIntoView({behavior:'smooth',block:'start'})},150)
}
function renderBar(selH,dateVN){
  const scroll=document.getElementById('bar-scroll');if(!scroll)return
  const nowH=getVN().h,nowHc=getHChi(nowH)
  scroll.innerHTML=GIO12.map(g=>{
    const vn={...dateVN,h:g.h,m:0,s:0},r=calc(vn),qname=r?HN[r.up-1][r.lo-1]:'—'
    const hc=getHChi(g.h),isActive=(hc===getHChi(selH)),isNow=(hc===nowHc)
    return`<div class="bar-cell${isActive?' active':''}${isNow?' now-marker':''}" onclick="window._w.selectGio(${g.h})"><div class="bc-chi">${g.chi}</div><div class="bc-time">${g.label}</div><div class="bc-que">${qname}</div></div>`
  }).join('')
  const idx=GIO12.findIndex(g=>getHChi(g.h)===getHChi(selH))
  if(idx>=0){setTimeout(()=>{const cells=scroll.querySelectorAll('.bar-cell');if(cells[idx])cells[idx].scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'})},50)}
}
function selectGio(h){
  liveMode=false;document.getElementById('pick-time').value=h
  if(currentView==='boc')switchView('que')
  doCalc(true)
  setTimeout(()=>{const el=document.getElementById('view-que');if(el)el.scrollIntoView({behavior:'smooth',block:'start'})},100)
}
function switchView(v){
  currentView=v;const isBoc=v==='boc'
  document.getElementById('view-boc').classList.toggle('show',isBoc)
  document.getElementById('view-que').style.display=isBoc?'none':'block'
  document.getElementById('cal-inline').style.display=isBoc?'none':'block'
  document.getElementById('sel-info').style.display=isBoc?'none':''
  document.getElementById('btn-now').style.display=isBoc?'none':''
  document.getElementById('btn-xemgio').classList.toggle('btn-mode-inactive',isBoc)
  document.getElementById('btn-bocque').classList.toggle('btn-mode-inactive',!isBoc)
  if(isBoc&&bqStep===1&&!bqDrawn.left)initBocQue()
}
function onCardsScroll(el){
  const w=el.offsetWidth,idx=Math.round(el.scrollLeft/w)
  el.querySelectorAll('.cards-dot').forEach((d,i)=>d.classList.toggle('active',i===idx))
}
function doCalc(shouldAutoSave=false){
  const vn=liveMode?getVN():getPickerVN()
  const r=calc(vn)
  const si=document.getElementById('sel-info')
  if(!liveMode&&r){
    const gioChi=CHI[r.hc-1],ld=r.lu.ld,lm=r.lu.lm,yn=r.lu.yn
    si.textContent=`Giờ ${gioChi} · Ngày ${ld} tháng ${lm} năm ${yn}`;si.style.display='block'
  }else{si.style.display='none'}
  if(!r){document.getElementById('cards').innerHTML='<div class="empty">Không tìm được âm lịch cho ngày này.</div>';return}
  const{up,lo,hao,L6,hoU,hoL,bU,bL,B6}=r
  const hoL6=[...TL[hoL],...TL[hoU]]
  const cardsEl=document.getElementById('cards')
  cardsEl.innerHTML=
    card('QUẺ CHÁNH',up,lo,L6,hao,haoInfo(hao,up,lo))+
    '<div class="divider"></div>'+
    card('HỘ QUÁI',hoU,hoL,hoL6,null,haoInfoHo(hao,hoU,hoL))+
    '<div class="divider"></div>'+
    card('QUẺ BIẾN',bU,bL,B6,hao,haoInfo(hao,bU,bL))
  const dots=document.getElementById('cards-dots')
  dots.innerHTML=['QUẺ CHÁNH','HỘ QUÁI','QUẺ BIẾN'].map((_,i)=>`<div class="cards-dot${i===0?' active':''}" id="dot${i}"></div>`).join('')
  const hc2=getHChi(vn.h)
  document.getElementById('giochi').textContent=`Giờ ${CHI[hc2-1]} · Số ${hc2}`
  document.getElementById('lunardisp').textContent=`Ngày ${r.lu.ld} tháng ${r.lu.lm} năm ${r.lu.yn} (ÂL)`
  document.getElementById('footer').style.display='block'
  const _dv=document.getElementById('pick-date').value
  if(_dv){const[_Y,_M,_D]=_dv.split('-').map(Number);renderBar(vn.h,{Y:_Y,M:_M,D:_D})}
  // Notify React for save feature
  if(window.__dichly_setQue)window.__dichly_setQue({queName:HN[up-1][lo-1],hao,trigUp:up,trigLo:lo,source:'xem_gio',sourceData:{date:vn,lunarDate:{ld:r.lu.ld,lm:r.lu.lm,yn:r.lu.yn}}})
  if(shouldAutoSave&&window.__dichly_autoSave)window.__dichly_autoSave({queName:HN[up-1][lo-1],hao,trigUp:up,trigLo:lo,source:'xem_gio',sourceData:{date:vn,lunarDate:{ld:r.lu.ld,lm:r.lu.lm,yn:r.lu.yn}}})
}
function tick(){
  const vn=getVN(),hc=getHChi(vn.h)
  const clk=document.getElementById('clk');if(clk)clk.textContent=`${pad(vn.h)}:${pad(vn.m)}:${pad(vn.s)}`
  if(liveMode){
    const pickDate=document.getElementById('pick-date');if(pickDate)pickDate.value=`${vn.Y}-${pad(vn.M)}-${pad(vn.D)}`
    calSyncDisplay()
    const hmap=[{s:23,e:1,v:23},{s:1,e:3,v:1},{s:3,e:5,v:3},{s:5,e:7,v:5},{s:7,e:9,v:7},{s:9,e:11,v:9},{s:11,e:13,v:11},{s:13,e:15,v:13},{s:15,e:17,v:15},{s:17,e:19,v:17},{s:19,e:21,v:19},{s:21,e:23,v:21}]
    let sel=23;if(vn.h===23||vn.h===0)sel=23;else{const m=hmap.find(x=>vn.h>=x.s&&vn.h<x.e);if(m)sel=m.v}
    const pt=document.getElementById('pick-time');if(pt)pt.value=sel
    const giochi=document.getElementById('giochi');if(giochi)giochi.textContent=`Giờ ${CHI[hc-1]} · Số ${hc}`
    const lu=toLunar(vn.Y,vn.M,vn.D)
    const lunardisp=document.getElementById('lunardisp');if(lu&&lunardisp)lunardisp.textContent=`Ngày ${lu.ld} tháng ${lu.lm} năm ${lu.yn} (ÂL)`
    if(hc!==lastHChi){lastHChi=hc;doCalc()}
  }
  if(themeMode==='auto'){const _at=_autoTheme();if(document.documentElement.getAttribute('data-theme')!==_at)document.documentElement.setAttribute('data-theme',_at)}
}
// BỐC QUẺ
function makeDeck(){const d=[];for(const s of SUITS)for(const v of VALS)d.push({v,s:s.sym,c:s.color});return d}
function shuffleDeck(d){for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]]}return d}
function cardToTrigram(v){if(['A','J','Q','K','9'].includes(v))return 1;const n=parseInt(v);if(n===10)return 2;let r=n%8;return r===0?8:r}
function initBocQue(){bqDeck=shuffleDeck(makeDeck());bqDrawn={left:null,right:null};bqStep=1;bqHistory=[];bqDrawCount=0}
function drawCard(side){
  if(side==='left'&&bqStep!==1)return
  if(side==='right'&&bqStep!==2)return
  if(!bqDeck.length)initBocQue()
  const c=bqDeck.pop();bqDrawn[side]=c
  const tg=cardToTrigram(c.v),ba=BAGUA[tg]
  const el=document.getElementById('card-'+side)
  el.className=`bq-card revealed ${c.c}`
  el.innerHTML=`<div class="card-top"><div class="card-val">${c.v}</div><div class="card-suit">${c.s}</div></div><div class="card-center">${c.s}</div><div class="card-bot"><div class="card-val">${c.v}</div><div class="card-suit">${c.s}</div></div>`
  document.getElementById('tg-'+side).innerHTML=`<span>${ba.e}</span> ${ba.s} <strong>${ba.n}</strong>`
  if(side==='left'){
    bqStep=2
    document.getElementById('bq-instr').innerHTML=`<strong>Tay trái: ${c.v}${c.s} → ${ba.e} ${ba.n}</strong><br>Bây giờ bốc tay phải.`
    document.getElementById('bq-main-btn').textContent='🃏 Bốc Tay Phải'
    document.getElementById('bqs1').className='bq-step done'
    document.getElementById('bqs2').className='bq-step active'
  }else{
    bqStep=3
    const up=cardToTrigram(bqDrawn.left.v),lo=tg,sum=up+lo
    let hao=sum%6;if(!hao)hao=6
    bqDrawCount++;bqHistory.unshift({n:bqDrawCount,L:bqDrawn.left,R:c,up,lo,hao,queName:HN[up-1][lo-1]})
    renderBqHistory()
    document.getElementById('bqs2').className='bq-step done'
    document.getElementById('bqs3').className='bq-step active'
    document.getElementById('bq-main-btn').textContent='☯ Xem 3 Tượng'
    document.getElementById('bq-reset').style.display='block'
    document.getElementById('bq-instr').innerHTML=`<strong>Tay phải: ${c.v}${c.s} → ${ba.e} ${ba.n}</strong><br>Nhấn để xem quẻ.`
    if(bqDrawCount>=10){document.getElementById('bq-reshuffle').style.display='block';document.getElementById('bq-main-btn').style.display='none'}
  }
}
function bqMainAction(){if(bqStep===1)drawCard('left');else if(bqStep===2)drawCard('right');else if(bqStep===3)calcBocQue()}
function calcBocQue(){
  const L=bqDrawn.left,R=bqDrawn.right;if(!L||!R)return
  const up=cardToTrigram(L.v),lo=cardToTrigram(R.v),sum=up+lo
  let hao=sum%6;if(!hao)hao=6
  const L6=[...TL[lo],...TL[up]]
  const hoL=l2t(L6[1],L6[2],L6[3]),hoU=l2t(L6[2],L6[3],L6[4])
  const B6=[...L6];B6[hao-1]=B6[hao-1]===1?0:1
  const bL=l2t(B6[0],B6[1],B6[2]),bU=l2t(B6[3],B6[4],B6[5])
  const hoL6=[...TL[hoL],...TL[hoU]]
  const sumEl=document.getElementById('bq-summary')
  sumEl.style.display='block'
  sumEl.innerHTML=`Tiên <span class="g">${BAGUA[up].e} ${BAGUA[up].n}</span> (${L.v}${L.s}) + Hậu <span class="g">${BAGUA[lo].e} ${BAGUA[lo].n}</span> (${R.v}${R.s})<br>Tổng ${up}+${lo}=${sum} → <span class="r">Hào ${hao} động</span>`
  const cs=document.getElementById('bq-cards')
  cs.innerHTML=card('QUẺ CHÁNH',up,lo,L6,hao,haoInfo(hao,up,lo))+card('HỘ QUÁI',hoU,hoL,hoL6,null,haoInfoHo(hao,hoU,hoL))+card('QUẺ BIẾN',bU,bL,B6,hao,haoInfo(hao,bU,bL))
  document.getElementById('bq-cards-dots').innerHTML=['QUẺ CHÁNH','HỘ QUÁI','QUẺ BIẾN'].map((_,i)=>`<div class="cards-dot${i===0?' active':''}" id="bqdot${i}"></div>`).join('')
  cs.scrollLeft=0
  document.getElementById('bq-cards-scroll').style.display='block'
  document.getElementById('bq-main-btn').style.display='none'
  document.getElementById('bq-reset').style.display='block'
  document.getElementById('bqs3').className='bq-step done'
  setTimeout(()=>document.getElementById('bq-cards-scroll').scrollIntoView({behavior:'smooth',block:'nearest'}),100)
  if(window.__dichly_setQue)window.__dichly_setQue({queName:HN[up-1][lo-1],hao,trigUp:up,trigLo:lo,source:'boc_bai',sourceData:{left:`${L.v}${L.s}`,right:`${R.v}${R.s}`}})
  if(window.__dichly_autoSave)window.__dichly_autoSave({queName:HN[up-1][lo-1],hao,trigUp:up,trigLo:lo,source:'boc_bai',sourceData:{left:`${L.v}${L.s}`,right:`${R.v}${R.s}`}})
}
function resetBocQue(){
  bqDrawn={left:null,right:null};bqStep=1;
  ['left','right'].forEach(s=>{
    const el=document.getElementById('card-'+s)
    el.className='bq-card back';el.innerHTML='<div class="back-inner">☯</div>'
    document.getElementById('tg-'+s).innerHTML='Chưa bốc'
  })
  document.getElementById('bq-instr').innerHTML=`<strong>Tĩnh tâm · Chiêm nghiệm câu hỏi</strong><br>Hít thở sâu, tập trung vào điều bạn muốn hỏi.<br>Khi sẵn sàng, hãy bốc bài.`
  document.getElementById('bq-summary').style.display='none'
  document.getElementById('bq-cards-scroll').style.display='none'
  document.getElementById('bq-main-btn').style.display=bqDrawCount>=10?'none':'block'
  document.getElementById('bq-main-btn').textContent='🃏 Bốc Tay Trái'
  document.getElementById('bq-reset').style.display='none'
  ;['bqs1','bqs2','bqs3'].forEach((id,i)=>{document.getElementById(id).className='bq-step'+(i===0?' active':'')})
}
function reshuffleDeck(){bqDeck=shuffleDeck(makeDeck());bqDrawn={left:null,right:null};bqStep=1;bqDrawCount=0;document.getElementById('bq-reshuffle').style.display='none';resetBocQue();document.getElementById('bq-main-btn').style.display='block'}
function renderBqHistory(){
  const wrap=document.getElementById('bq-hist-wrap'),list=document.getElementById('bq-hist-list')
  if(!bqHistory.length){wrap.style.display='none';return}
  wrap.style.display='block'
  list.innerHTML=bqHistory.map((h,idx)=>`<div class="bq-hist-item${idx===0?' active':''}" onclick="window._w.showHistItem(${h.n-1})"><div class="bq-hist-num">#${h.n}</div><div class="bq-hist-cards"><div class="bq-hist-card ${h.L.c}">${h.L.v}${h.L.s}</div><div style="font-size:10px;color:var(--text3);align-self:center">→</div><div class="bq-hist-card ${h.R.c}">${h.R.v}${h.R.s}</div></div><div class="bq-hist-info"><div class="bq-hist-que">${h.queName}</div><div class="bq-hist-hao">Hào ${h.hao} động</div></div></div>`).join('')
}
function showHistItem(idx){
  const h=bqHistory[idx];if(!h)return
  const{up,lo,hao}=h,L6=[...TL[lo],...TL[up]]
  const hoL=l2t(L6[1],L6[2],L6[3]),hoU=l2t(L6[2],L6[3],L6[4])
  const B6=[...L6];B6[hao-1]=B6[hao-1]===1?0:1
  const bL=l2t(B6[0],B6[1],B6[2]),bU=l2t(B6[3],B6[4],B6[5])
  const hoL6=[...TL[hoL],...TL[hoU]]
  const cs=document.getElementById('bq-cards')
  cs.innerHTML=card('QUẺ CHÁNH',up,lo,L6,hao,haoInfo(hao,up,lo))+card('HỘ QUÁI',hoU,hoL,hoL6,null,haoInfoHo(hao,hoU,hoL))+card('QUẺ BIẾN',bU,bL,B6,hao,haoInfo(hao,bU,bL))
  cs.scrollLeft=0;document.getElementById('bq-cards-scroll').style.display='block'
  document.querySelectorAll('.bq-hist-item').forEach((el,i)=>{el.classList.toggle('active',bqHistory[i].n===h.n)})
  document.getElementById('bq-cards-scroll').scrollIntoView({behavior:'smooth',block:'nearest'})
}
function switchBqTab(t){
  bqTab=t;['bai','bsx','sdt'].forEach(id=>{
    document.getElementById('tab-'+id).classList.toggle('active',id===t)
    document.getElementById('panel-'+id).classList.toggle('show',id===t)
  })
}
// BSX
function parseBsxNums(raw){
  const digits=raw.replace(/\D/g,'').split('').map(Number);if(digits.length<5)return null
  const dotIdx=raw.indexOf('.')
  if(dotIdx>=0){const left=raw.slice(0,dotIdx).replace(/\D/g,'').split('').map(Number);const right=raw.slice(dotIdx+1).replace(/\D/g,'').split('').map(Number);if(left.length>=3&&right.length>=2)return{left:left.slice(-3),right:right.slice(0,2),raw}}
  const d5=digits.slice(-5);return{left:d5.slice(0,3),right:d5.slice(3,5),raw}
}
function onBsxInput(val){
  const p=parseBsxNums(val),hint=document.getElementById('bsx-hint')
  if(!p||val.replace(/\D/g,'').length<5){hint.innerHTML='<span style="color:var(--text3)">Cần ít nhất 5 chữ số</span>';return}
  const tien=sumMod8(p.left),hau=sumMod8(p.right),hao=sumMod6([...p.left,...p.right])
  hint.innerHTML=`<span style="color:var(--gold)">${p.left.join('')}</span>·<span style="color:var(--gold)">${p.right.join('')}</span> &nbsp;→&nbsp; Tiên <strong>${BAGUA[tien].n}</strong> · Hậu <strong>${BAGUA[hau].n}</strong> · Hào <span style="color:var(--red)">${hao}</span> động`
}
function calcBsx(){
  const raw=document.getElementById('bsx-input').value,p=parseBsxNums(raw)
  if(!p){alert('Vui lòng nhập biển số có ít nhất 5 chữ số!');return}
  const tien=sumMod8(p.left),hau=sumMod8(p.right),hao=sumMod6([...p.left,...p.right])
  const bt=BAGUA[tien],bh=BAGUA[hau],allVals=[...p.left,...p.right]
  const summary=`<span style="color:var(--gold)">${p.left.join('')}</span>·<span style="color:var(--gold)">${p.right.join('')}</span><br>Tiên: ${p.left.join('+')}=${p.left.reduce((a,b)=>a+b,0)} → <strong>${bt.e} ${bt.n}</strong><br>Hậu: ${p.right.join('+')}=${p.right.reduce((a,b)=>a+b,0)} → <strong>${bh.e} ${bh.n}</strong><br>Hào động: tổng ${allVals.reduce((a,b)=>a+b,0)} ÷ 6 dư <span style="color:var(--red)">${hao}</span>`
  calcAndRender(tien,hau,hao,'bsx-cards','bsx-dots','bsx-result',summary)
  const plate=raw.trim().toUpperCase()
  bsxHistory.unshift({plate,tien,hau,hao,queName:HN[tien-1][hau-1],left:p.left,right:p.right,allVals})
  renderBsxHistory(0);document.getElementById('bsx-input').value='';document.getElementById('bsx-hint').innerHTML=''
  if(window.__dichly_setQue)window.__dichly_setQue({queName:HN[tien-1][hau-1],hao,trigUp:tien,trigLo:hau,source:'bien_so',sourceData:{input:plate}})
  if(window.__dichly_autoSave)window.__dichly_autoSave({queName:HN[tien-1][hau-1],hao,trigUp:tien,trigLo:hau,source:'bien_so',sourceData:{input:plate}})
}
function calcAndRender(up,lo,hao,cardsId,dotsId,resultId,summaryHtml){
  const L6=[...TL[lo],...TL[up]]
  const hoL=l2t(L6[1],L6[2],L6[3]),hoU=l2t(L6[2],L6[3],L6[4])
  const B6=[...L6];B6[hao-1]=B6[hao-1]===1?0:1
  const bL=l2t(B6[0],B6[1],B6[2]),bU=l2t(B6[3],B6[4],B6[5])
  const hoL6=[...TL[hoL],...TL[hoU]]
  const rEl=document.getElementById(resultId);rEl.style.display='block';rEl.innerHTML=summaryHtml
  const cs=document.getElementById(cardsId);cs.style.display='flex'
  cs.innerHTML=card('QUẺ CHÁNH',up,lo,L6,hao,haoInfo(hao,up,lo))+card('HỘ QUÁI',hoU,hoL,hoL6,null,haoInfoHo(hao,hoU,hoL))+card('QUẺ BIẾN',bU,bL,B6,hao,haoInfo(hao,bU,bL))
  document.getElementById(dotsId).innerHTML=['QUẺ CHÁNH','HỘ QUÁI','QUẺ BIẾN'].map((_,i)=>`<div class="cards-dot${i===0?' active':''}" id="dot_${dotsId}_${i}"></div>`).join('')
  cs.scrollLeft=0;setTimeout(()=>rEl.scrollIntoView({behavior:'smooth',block:'nearest'}),100)
}
function renderBsxHistory(activeIdx){
  const wrap=document.getElementById('bsx-hist'),list=document.getElementById('bsx-hist-list')
  if(!bsxHistory.length){wrap.style.display='none';return}
  wrap.style.display='block'
  list.innerHTML=bsxHistory.map((h,i)=>`<div class="bsx-hist-item${i===activeIdx?' active':''}" onclick="window._w.showBsxHist(${i})"><div class="bsx-hist-plate">${h.plate}</div><div class="bsx-hist-info"><div class="bsx-hist-que">${BAGUA[h.tien].e} ${BAGUA[h.tien].n} · ${BAGUA[h.hau].e} ${BAGUA[h.hau].n}</div><div class="bsx-hist-que" style="color:var(--gold-light)">${h.queName}</div><div class="bsx-hist-hao">Hào ${h.hao} động</div></div><div class="bsx-hist-del" onclick="event.stopPropagation();window._w.delBsxHist(${i})">×</div></div>`).join('')
}
function showBsxHist(idx){
  const h=bsxHistory[idx],bt=BAGUA[h.tien],bh=BAGUA[h.hau]
  const summary=`<span style="color:var(--gold)">${h.left.join('')}</span>·<span style="color:var(--gold)">${h.right.join('')}</span><br>Tiên: ${h.left.join('+')}=${h.left.reduce((a,b)=>a+b,0)} → <strong>${bt.e} ${bt.n}</strong><br>Hậu: ${h.right.join('+')}=${h.right.reduce((a,b)=>a+b,0)} → <strong>${bh.e} ${bh.n}</strong><br>Hào động: tổng ${h.allVals.reduce((a,b)=>a+b,0)} ÷ 6 dư <span style="color:var(--red)">${h.hao}</span>`
  calcAndRender(h.tien,h.hau,h.hao,'bsx-cards','bsx-dots','bsx-result',summary);renderBsxHistory(idx)
  document.getElementById('bsx-cards').scrollIntoView({behavior:'smooth',block:'nearest'})
}
function delBsxHist(idx){bsxHistory.splice(idx,1);renderBsxHistory(0)}
// SDT
function parseSdtNums(raw){
  const digits=raw.replace(/\D/g,'').split('').map(Number);if(digits.length<10)return null
  const d=digits.slice(0,10);return{left:d.slice(0,4),right:d.slice(4,10),raw}
}
function padSdtLeft(zeros){
  const input=document.getElementById('sdt-input')
  const digits=input.value.replace(/\D/g,'')
  input.value='0'.repeat(zeros)+digits
  onSdtInput(input.value)
}
function onSdtInput(val){
  const p=parseSdtNums(val),hint=document.getElementById('sdt-hint')
  if(!p){
    const n=val.replace(/\D/g,'').length,missing=10-n
    if(n>=8&&n<=9){
      const prefix='0'.repeat(missing)
      hint.innerHTML=`<span style="color:var(--text3)">Đã nhập ${n}/10 số</span> · <span style="color:var(--gold-dark);cursor:pointer;text-decoration:underline;font-size:11px" onclick="window._w.padSdtLeft(${missing})">Thêm ${prefix} vào đầu →</span>`
    }else{
      hint.innerHTML=`<span style="color:var(--text3)">Đã nhập ${n}/10 số</span>`
    }
    return
  }
  const tien=sumMod8(p.left),hau=sumMod8(p.right),hao=sumMod6([...p.left,...p.right])
  hint.innerHTML=`<span style="color:var(--gold)">${p.left.join('')}</span> · <span style="color:var(--gold)">${p.right.join('')}</span> &nbsp;→&nbsp; Tiên <strong>${BAGUA[tien].n}</strong> · Hậu <strong>${BAGUA[hau].n}</strong> · Hào <span style="color:var(--red)">${hao}</span> động`
}
function calcSdt(){
  const raw=document.getElementById('sdt-input').value,p=parseSdtNums(raw)
  if(!p){document.getElementById('sdt-hint').innerHTML=`<span style="color:var(--red)">Vui lòng nhập đủ 10 chữ số!</span>`;return}
  const tien=sumMod8(p.left),hau=sumMod8(p.right),hao=sumMod6([...p.left,...p.right])
  const bt=BAGUA[tien],bh=BAGUA[hau],allVals=[...p.left,...p.right]
  const tSum=p.left.reduce((a,b)=>a+b,0),hSum=p.right.reduce((a,b)=>a+b,0)
  const summary=`<span style="color:var(--gold)">${p.left.join('')}</span> · <span style="color:var(--gold)">${p.right.join('')}</span><br>Tiên: ${p.left.join('+')}=${tSum} → <strong>${bt.e} ${bt.n}</strong><br>Hậu: ${p.right.join('+')}=${hSum} → <strong>${bh.e} ${bh.n}</strong><br>Hào động: tổng ${allVals.reduce((a,b)=>a+b,0)} ÷ 6 dư <span style="color:var(--red)">${hao}</span>`
  calcAndRender(tien,hau,hao,'sdt-cards','sdt-dots','sdt-result',summary)
  const num=raw.replace(/\D/g,'').slice(0,10),display=num.slice(0,4)+' '+num.slice(4,7)+' '+num.slice(7,10)
  sdtHistory.unshift({display,num,tien,hau,hao,queName:HN[tien-1][hau-1],left:p.left,right:p.right,allVals,tSum,hSum})
  renderSdtHistory(0);document.getElementById('sdt-input').value='';document.getElementById('sdt-hint').innerHTML=''
  if(window.__dichly_setQue)window.__dichly_setQue({queName:HN[tien-1][hau-1],hao,trigUp:tien,trigLo:hau,source:'so_dt',sourceData:{input:display}})
  if(window.__dichly_autoSave)window.__dichly_autoSave({queName:HN[tien-1][hau-1],hao,trigUp:tien,trigLo:hau,source:'so_dt',sourceData:{input:display}})
}
function renderSdtHistory(activeIdx){
  const wrap=document.getElementById('sdt-hist'),list=document.getElementById('sdt-hist-list')
  if(!sdtHistory.length){wrap.style.display='none';return}
  wrap.style.display='block'
  list.innerHTML=sdtHistory.map((h,i)=>`<div class="bsx-hist-item${i===activeIdx?' active':''}" onclick="window._w.showSdtHist(${i})"><div class="bsx-hist-plate" style="font-size:13px;letter-spacing:1px">${h.display}</div><div class="bsx-hist-info"><div class="bsx-hist-que">${BAGUA[h.tien].e} ${BAGUA[h.tien].n} · ${BAGUA[h.hau].e} ${BAGUA[h.hau].n}</div><div class="bsx-hist-que" style="color:var(--gold-light)">${h.queName}</div><div class="bsx-hist-hao">Hào ${h.hao} động</div></div><div class="bsx-hist-del" onclick="event.stopPropagation();window._w.delSdtHist(${i})">×</div></div>`).join('')
}
function showSdtHist(idx){
  const h=sdtHistory[idx],bt=BAGUA[h.tien],bh=BAGUA[h.hau]
  const summary=`<span style="color:var(--gold)">${h.left.join('')}</span> · <span style="color:var(--gold)">${h.right.join('')}</span><br>Tiên: ${h.left.join('+')}=${h.tSum} → <strong>${bt.e} ${bt.n}</strong><br>Hậu: ${h.right.join('+')}=${h.hSum} → <strong>${bh.e} ${bh.n}</strong><br>Hào động: tổng ${h.allVals.reduce((a,b)=>a+b,0)} ÷ 6 dư <span style="color:var(--red)">${h.hao}</span>`
  calcAndRender(h.tien,h.hau,h.hao,'sdt-cards','sdt-dots','sdt-result',summary);renderSdtHistory(idx)
  document.getElementById('sdt-cards').scrollIntoView({behavior:'smooth',block:'nearest'})
}
function delSdtHist(idx){sdtHistory.splice(idx,1);renderSdtHistory(0)}

// ─── APP SHELL (never re-renders to protect DOM mutations) ─────────────────────
const AppShell = memo(function AppShell() {
  return (
    <div id="dichly-app">
      {/* HEADER */}
      <div className="hdr" style={{position:'relative'}}>
        <button className="theme-btn" id="theme-btn" onClick={toggleTheme}>☀</button>
        <div className="hdr-cosmos">
          <div className="hdr-row r1"><span>☯</span></div>
          <div className="hdr-row r2"><span>⚊</span><span>⚋</span></div>
          <div className="hdr-row r3"><span>⚌</span><span>⚍</span><span>⚎</span><span>⚏</span></div>
          <div className="hdr-row r4"><span>☰</span><span>☱</span><span>☲</span><span>☳</span><span>☴</span><span>☵</span><span>☶</span><span>☷</span></div>
        </div>
        <div className="hdr-title">DỊCH LÝ VIỆT NAM</div>
        <div className="hdr-sub">LẬP QUẺ THEO GIỜ</div>
        <div className="clock-box">
          <div className="clock" id="clk">--:--:--</div>
          <div className="gio-chi" id="giochi">——</div>
          <div className="lunar" id="lunardisp">Đang tra âm lịch...</div>
        </div>
        <div className="picker-wrap">
          <div className="picker-row">
            <input type="date" id="pick-date" style={{display:'none'}} onInput={onPickChange} />
            <select className="picker-input" id="pick-time" onChange={onPickChange} style={{width:'160px'}}>
              <option value="23">Giờ Tý (23-1h)</option>
              <option value="1">Giờ Sửu (1-3h)</option>
              <option value="3">Giờ Dần (3-5h)</option>
              <option value="5">Giờ Mão (5-7h)</option>
              <option value="7">Giờ Thìn (7-9h)</option>
              <option value="9">Giờ Tỵ (9-11h)</option>
              <option value="11">Giờ Ngọ (11-13h)</option>
              <option value="13">Giờ Mùi (13-15h)</option>
              <option value="15">Giờ Thân (15-17h)</option>
              <option value="17">Giờ Dậu (17-19h)</option>
              <option value="19">Giờ Tuất (19-21h)</option>
              <option value="21">Giờ Hợi (21-23h)</option>
            </select>
            <button className="btn btn-xemgio btn-mode-inactive" id="btn-xemgio" onClick={() => switchView('que')}>🕐 Xem giờ</button>
            <button className="btn btn-boc btn-mode-inactive" id="btn-bocque" onClick={() => switchView('boc')}>🃏 Bốc Quẻ</button>
          </div>
          {/* Calendar inline */}
          <div className="cal-inline" id="cal-inline">
            <div className="cal-nav">
              <button className="cal-nav-btn" onClick={() => calNavYear(-1)} title="Năm trước">«</button>
              <button className="cal-nav-btn" onClick={() => calNavMonth(-1)} title="Tháng trước">‹</button>
              <span className="cal-head-month" id="cal-head-month" onClick={calToggleMonth}></span>
              <span className="cal-head-year" id="cal-head-year" onClick={calToggleYear}></span>
              <button className="cal-nav-btn" onClick={() => calNavMonth(1)} title="Tháng sau">›</button>
              <button className="cal-nav-btn" onClick={() => calNavYear(1)} title="Năm sau">»</button>
            </div>
            <div className="cal-overlay" id="cal-month-picker" style={{display:'none'}}></div>
            <div className="cal-overlay" id="cal-year-picker" style={{display:'none'}}></div>
            <div className="cal-dows">
              {['CN','T2','T3','T4','T5','T6','T7'].map(d=><div key={d} className="cal-dow">{d}</div>)}
            </div>
            <div className="cal-grid" id="cal-grid"></div>
            <div className="cal-day-info" id="cal-day-info"></div>
            <button className="cal-evt-toggle" id="cal-evt-toggle" onClick={calToggleEvtPanel}>✦ Ngày kỷ niệm</button>
            <div className="cal-evt-panel" id="cal-evt-panel">
              <div className="cal-evt-panel-hdr">
                <span className="cal-evt-panel-title">NGÀY KỶ NIỆM (NGÀY GIỖ, LỄ..)</span>
              </div>
              <div className="cal-evt-list" id="cal-evt-list"></div>
              <div className="cal-evt-form">
                <input className="cal-evt-input" id="evt-name" placeholder="Tên sự kiện…" maxLength={40} />
                <div className="cal-evt-row">
                  <select className="cal-evt-sel" id="evt-ld"></select>
                  <select className="cal-evt-sel" id="evt-lm"></select>
                  <button className="cal-evt-add-btn" onClick={calAddEvent}>+ Thêm</button>
                </div>
              </div>
            </div>
          </div>
          <div className="sel-info" id="sel-info" style={{display:'none'}}></div>
          <button className="btn-now" id="btn-now" onClick={goNow}>↺ Quay về hiện tại</button>
        </div>
      </div>

      {/* 12 GIỜ BAR */}
      <div className="bar-wrap" id="bar-wrap">
        <div className="bar-title">12 GIỜ TRONG NGÀY</div>
        <div className="bar-scroll" id="bar-scroll"></div>
      </div>

      {/* BODY */}
      <div className="body" style={{padding:'0 0 40px'}}>
        <div className="formula" id="formula" style={{display:'none',margin:'12px 12px 0'}}></div>

        {/* QUẺ VIEW */}
        <div id="view-que">
          <div className="cards-scroll" id="cards" onScroll={e => onCardsScroll(e.currentTarget)}>
            <div className="hcard" style={{display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text3)',fontSize:'14px',lineHeight:'2',textAlign:'center'}}>
              Chọn giờ trong thanh bên dưới để xem quẻ
            </div>
          </div>
          <div className="cards-dots" id="cards-dots"></div>
        </div>

        {/* BỐC QUẺ VIEW */}
        <div id="view-boc" className="bocque-wrap">
          <div className="bq-tabs">
            <div className="bq-tab active" id="tab-bai" onClick={() => switchBqTab('bai')}>🃏 BỐC BÀI</div>
            <div className="bq-tab" id="tab-bsx" onClick={() => switchBqTab('bsx')}>🚗 BIỂN SỐ</div>
            <div className="bq-tab" id="tab-sdt" onClick={() => switchBqTab('sdt')}>📱 SỐ ĐT</div>
          </div>

          {/* PANEL: BỐC BÀI */}
          <div className="bq-panel show" id="panel-bai">
            <div className="bq-steps">
              <div className="bq-step active" id="bqs1">1</div>
              <div className="bq-step" id="bqs2">2</div>
              <div className="bq-step" id="bqs3">3</div>
            </div>
            <div className="bq-instr" id="bq-instr">
              <strong>Tĩnh tâm · Chiêm nghiệm câu hỏi</strong><br/>
              Hít thở sâu, tập trung vào điều bạn muốn hỏi.<br/>
              Khi sẵn sàng, hãy bốc bài.
            </div>
            <div className="bq-cards">
              <div className="bq-slot">
                <div className="bq-slot-lbl">TAY TRÁI · TIÊN</div>
                <div className="bq-card back" id="card-left" onClick={() => drawCard('left')}>
                  <div className="back-inner">☯</div>
                </div>
                <div className="bq-card-tg" id="tg-left">Chưa bốc</div>
              </div>
              <div className="bq-slot">
                <div className="bq-slot-lbl">TAY PHẢI · HẬU</div>
                <div className="bq-card back" id="card-right" onClick={() => drawCard('right')}>
                  <div className="back-inner">☯</div>
                </div>
                <div className="bq-card-tg" id="tg-right">Chưa bốc</div>
              </div>
            </div>
            <div className="bq-summary" id="bq-summary" style={{display:'none'}}></div>
            <div className="bq-btn-row">
              <button className="bq-draw-btn" id="bq-main-btn" onClick={bqMainAction}>
                🃏 Bốc Tay Trái
              </button>
              <div className="bq-reset" id="bq-reset" onClick={resetBocQue} style={{display:'none'}}>↺ Bốc lại</div>
            </div>
            <div id="bq-cards-scroll" style={{display:'none',marginTop:'16px'}}>
              <div className="cards-scroll" id="bq-cards" onScroll={e => onCardsScroll(e.currentTarget)}></div>
              <div className="cards-dots" id="bq-cards-dots"></div>
            </div>
            <div className="bq-reshuffle" id="bq-reshuffle" style={{display:'none'}}>
              <p>🃏 Bộ bài đã qua <strong>10 lần bốc</strong>.<br/>Xào bài lại để tiếp tục.<br/><span style={{fontSize:'11px',color:'var(--text3)'}}>Lịch sử các lần bốc vẫn được giữ lại.</span></p>
              <div className="bq-reshuffle-btn" onClick={reshuffleDeck}>↺ Xào Bài Lại</div>
            </div>
          </div>

          {/* PANEL: BIỂN SỐ XE */}
          <div className="bq-panel" id="panel-bsx">
            <div className="bq-instr">
              <strong>Suy tượng Biển Số Xe</strong><br/>
              Gõ biển số, app tự tách 3 số trái · 2 số phải
            </div>
            <input className="bsx-text-input" type="text" id="bsx-input"
              placeholder="51G-123.45" inputMode="text"
              onInput={e => onBsxInput(e.target.value)}
              onKeyDown={e => e.key==='Enter' && calcBsx()}
            />
            <div className="bq-input-hint" id="bsx-hint" style={{marginTop:'8px',minHeight:'20px'}}></div>
            <div className="bq-input-result" id="bsx-result" style={{marginTop:'4px',display:'none'}}></div>
            <div className="cards-scroll" id="bsx-cards" onScroll={e => onCardsScroll(e.currentTarget)} style={{display:'none',marginTop:'8px'}}></div>
            <div className="cards-dots" id="bsx-dots" style={{marginBottom:'8px'}}></div>
            <div className="bsx-hist" id="bsx-hist" style={{display:'none'}}>
              <div className="bsx-hist-title">LỊCH SỬ</div>
              <div className="bsx-hist-list" id="bsx-hist-list"></div>
            </div>
          </div>

          {/* PANEL: SỐ ĐIỆN THOẠI */}
          <div className="bq-panel" id="panel-sdt">
            <div className="bq-instr">
              <strong>Suy tượng Số Điện Thoại</strong><br/>
              4 số đầu → Tiên · 6 số đuôi → Hậu
            </div>
            <input className="bsx-text-input" type="text" id="sdt-input"
              placeholder="0909 123 456" inputMode="numeric"
              onInput={e => onSdtInput(e.target.value)}
              onKeyDown={e => e.key==='Enter' && calcSdt()}
            />
            <div className="bq-input-hint" id="sdt-hint" style={{marginTop:'8px',minHeight:'20px'}}></div>
            <div className="bq-input-result" id="sdt-result" style={{marginTop:'4px',display:'none'}}></div>
            <div className="cards-scroll" id="sdt-cards" onScroll={e => onCardsScroll(e.currentTarget)} style={{display:'none',marginTop:'8px'}}></div>
            <div className="cards-dots" id="sdt-dots" style={{marginBottom:'8px'}}></div>
            <div className="bsx-hist" id="sdt-hist" style={{display:'none'}}>
              <div className="bsx-hist-title">LỊCH SỬ</div>
              <div className="bsx-hist-list" id="sdt-hist-list"></div>
            </div>
          </div>

          <div className="bq-hist-wrap" id="bq-hist-wrap" style={{display:'none'}}>
            <div className="bq-hist-title">LỊCH SỬ BỐC</div>
            <div className="bq-hist-list" id="bq-hist-list"></div>
          </div>
        </div>

        <div className="footer" id="footer" style={{display:'none',padding:'8px 12px'}}>
          ── Dịch Lý Rồng Tiên ──
        </div>
      </div>
    </div>
  )
}, () => true) // never re-render — protects JS-managed DOM

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function DichLyApp() {
  const [queResult, setQueResult] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Expose functions for dynamic innerHTML onclick handlers
    window._w = {
      calSelectDay, calNavYear, calNavMonth, calPickMonth, calPickYear,
      calNavYearGroup, calToggleEvtPanel, calAddEvent, calDeleteEvent,
      selectGio, showHistItem, showBsxHist, delBsxHist, showSdtHist, delSdtHist, padSdtLeft,
    }
    // Callback for save feature
    window.__dichly_setQue = setQueResult

    // Initialize calendar + clock immediately (no auth needed)
    loadCalEvents()
    initThemeBtn()
    initPicker()
    tick()
    const id = setInterval(tick, 1000)

    // Check auth client-side after page is visible
    import('../../lib/supabase').then(({ createClient }) => {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data: { user: u } }) => {
        if (!u) return
        setUser(u)
        window.__dichly_autoSave = (data) => autoSaveQue(data).catch(() => {})

        // Khôi phục quẻ đang xem trước khi đăng nhập
        try {
          const pending = localStorage.getItem('pendingQueResult')
          if (pending) {
            localStorage.removeItem('pendingQueResult')
            const pendingQue = JSON.parse(pending)
            setQueResult(pendingQue)
            setShowModal(true)
          }
        } catch {}


        getAnniversaries().then(items => {
          calEvents = items
          renderEvtList?.()
          renderCal()
        }).catch(() => {})

        window.__dichly_addEvt = async (name, lm, ld) => {
          try {
            const item = await addAnniversary(name, lm, ld)
            calEvents.push(item)
            document.getElementById('evt-name').value = ''
            renderEvtList(); renderCal()
          } catch {}
        }
        window.__dichly_delEvt = async (evtId) => {
          try {
            await deleteAnniversary(evtId)
            calEvents = calEvents.filter(e => String(e.id) !== String(evtId))
            renderEvtList(); renderCal()
          } catch {}
        }
      })
    })

    // Handle URL params
    const params = new URLSearchParams(window.location.search)
    if (params.get('view') === 'boc') {
      switchView('boc')
      const tab = params.get('tab')
      if (tab === 'sdt') switchBqTab('sdt')
      else if (tab === 'bsx') switchBqTab('bsx')
    }

    // Biến thông toggle — managed here so listener is cleaned up on unmount
    function handleToggle(e) {
      const tog = e.target.closest('[data-toggle]')
      if (!tog) return
      const elId = tog.getAttribute('data-toggle')
      const el = document.getElementById(elId)
      const arr = document.getElementById('arr_' + elId)
      if (!el) return
      const open = el.classList.toggle('open')
      if (arr) arr.classList.toggle('open', open)
    }
    document.addEventListener('click', handleToggle)

    return () => {
      clearInterval(id)
      document.removeEventListener('click', handleToggle)
      delete window._w
      delete window.__dichly_setQue
      delete window.__dichly_autoSave
      delete window.__dichly_addEvt
      delete window.__dichly_delEvt
    }
  }, [])

  return (
    <>
      <UserButton user={user} loginOpen={showLoginModal} setLoginOpen={setShowLoginModal} />

      {/* App shell — never re-renders */}
      <AppShell />

      {/* Save FAB — appears after a hexagram is calculated */}
      {queResult && (
        <button className="save-que-fab" onClick={() => {
          if (user) {
            setShowModal(true)
          } else {
            localStorage.setItem('pendingQueResult', JSON.stringify(queResult))
            setShowLoginModal(true)
          }
        }}>
          💾 Lưu Quẻ
        </button>
      )}

      {/* Save modal */}
      {showModal && (
        <SaveModal
          queResult={queResult}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
