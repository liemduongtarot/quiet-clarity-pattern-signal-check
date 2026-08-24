from pathlib import Path
import re,sys
p=Path(sys.argv[1] if len(sys.argv)>1 else 'candidate/client/candidate.html')
s=p.read_text(encoding='utf-8')
new_classify="""function classify(e){const rep=num(e.rep),cross=num(e.cross),exc=num(e.exception),recent=num(e.recent),infl=num(e.influence),intr=num(e.interrupt),trend=num(e.trend);if(!e.response)return'INCOMPLETE';if(e.response==='A10')return'RESPONSE_UNKNOWN';if(((typeof isAdaptiveResponse)==='function'&&isAdaptiveResponse(e))||e.response==='A9')return'ADAPTIVE';if([rep,cross,exc,recent,infl,intr,trend].some(x=>x<0)||!e.impact||e.impact==='unknown')return'INSUFFICIENT';if(cross<=1&&exc>=2)return'INSUFFICIENT';if(rep<=1||cross===0)return'SITUATIONAL';if(!reinforcementKnown(e))return'UNREINFORCED';if(recent===0&&infl===0&&trend===0)return'RESIDUAL';if(e.impact==='none'&&infl>=1)return'INSUFFICIENT';if(e.impact==='none'&&infl===0)return'NO_MATERIAL_INFLUENCE';if(exc>=3&&intr<=1)return'WEAKENED';if(trend===1&&recent>=1)return'WEAKENED';if(recent>=2&&infl>=1&&intr>=2&&trend>=2&&exc<=1)return'ACTIVE';if(recent>=1&&infl>=1&&exc<=2)return'WEAKENED';return'INSUFFICIENT';}"""
s,n=re.subn(r"function classify\(e\)\{.*?\}function responsePhrase",new_classify+'function responsePhrase',s,count=1,flags=re.S)
assert n==1,'classify function not found exactly once'
if "NO_MATERIAL_INFLUENCE:'CHƯA THẤY ẢNH HƯỞNG THỰC TẾ ĐÁNG KỂ'" not in s:
    old="ADAPTIVE:'CHƯA THẤY PATTERN BẤT LỢI RÕ',INSUFFICIENT:'CHƯA ĐỦ BẰNG CHỨNG'"
    new="ADAPTIVE:'CHƯA THẤY PATTERN BẤT LỢI RÕ',NO_MATERIAL_INFLUENCE:'CHƯA THẤY ẢNH HƯỞNG THỰC TẾ ĐÁNG KỂ',INSUFFICIENT:'CHƯA ĐỦ BẰNG CHỨNG'"
    assert old in s,'state label anchor missing'
    s=s.replace(old,new,1)
anchor="if(state==='INSUFFICIENT')parts.push('Một hoặc nhiều lớp bằng chứng hiện tại chưa đủ rõ hoặc đang cạnh tranh nhau.');"
if "state==='NO_MATERIAL_INFLUENCE'" not in s:
    assert anchor in s,'uncertainty anchor missing'
    s=s.replace(anchor,anchor+"if(state==='NO_MATERIAL_INFLUENCE')parts.push('Cách phản ứng có thể vẫn tồn tại, nhưng dữ liệu hiện tại chưa cho thấy nó đang tạo một ảnh hưởng thực tế đáng kể trong phần được kiểm tra.');",1)
p.write_text(s,encoding='utf-8')
