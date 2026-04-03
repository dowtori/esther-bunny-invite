import pandas as pd
import json
import os

file_path = r"C:\Users\1004\테스트\에스더버니 방문 인원.xlsx"
sheet_name = '최종 (선정 후 고료 표기본)시트'

try:
    df = pd.read_excel(file_path, sheet_name=sheet_name, header=8)
    
    # Exclude cost related columns
    cols_to_drop = [c for c in df.columns if any(x in str(c).upper() for x in ['원가', '고료', '단가', '비용', '가격', 'CPR', '광고비'])]
    df_filtered = df.drop(columns=cols_to_drop)
    
    # Clean data
    for col in df_filtered.select_dtypes(include=['datetime64', 'datetimetz']).columns:
        df_filtered[col] = df_filtered[col].astype(str)
        
    df_filtered = df_filtered.fillna('')
    
    if '계정' in df_filtered.columns:
        df_filtered = df_filtered[df_filtered['계정'] != '']
    
    data = df_filtered.to_dict(orient='records')
    
    os.makedirs(r"C:\Users\1004\테스트\teumgyul\src\data", exist_ok=True)
    out_path = r"C:\Users\1004\테스트\teumgyul\src\data\esther_bunny_campaign.json"
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        
    print(f"Data successfully saved to {out_path}. Excluded columns: {cols_to_drop}")
    print(f"Final columns: {list(df_filtered.columns)}")
    print(f"Number of valid rows: {len(data)}")

except Exception as e:
    print("Error:", e)
