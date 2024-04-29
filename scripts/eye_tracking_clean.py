import pandas as pd
import os

os.chdir("D:\\RA - Spring 2024\\Eye-Tracking Data Cleaning\\data")


all_files = os.listdir()
# Load the first sheet of each Excel file 
sheets = [pd.read_excel(file_path) for file_path in all_files]
sheets[0].head()

consolidated_data = pd.DataFrame(columns=["File_Name", "Session_Name", "PPN", "GENDER_coded", "AGE"])

for file_path, sheet in zip(all_files, sheets):
    # Filter out invalid AGE entries
    valid_data = sheet[sheet["AGE"].apply(lambda x: str(x).isdigit())]
    
    # If no valid data, continue to the next file
    if valid_data.empty:
        continue
    
    # Extract the file name for identification
    file_name = file_path
    
    # Extract the session name; assuming the first valid session name is representative
    session_name = valid_data["Session_Name_"].iloc[0] if not valid_data.empty else "Unknown"

    # For GENDER, we use the most frequent value
    gender = valid_data["GENDER"].mode()[0] if not valid_data["GENDER"].mode().empty else "Unknown"
    
    # For AGE, we just take the 24th entry (this is arbitrary, any entry would work)
    age = valid_data["AGE"][24]
    
    # Append the extracted data to the consolidated DataFrame
    consolidated_data = consolidated_data._append({
        "File_Name": file_name, 
        "Session_Name": session_name,
        "GENDER_coded": gender, 
        "AGE": age
    }, ignore_index=True)

# Define the file path for the new revised CSV
os.chdir("D:\\RA - Spring 2024\\Eye-Tracking Data Cleaning")

# View data
consolidated_data
consolidated_data["PPN"]= consolidated_data['Session_Name'].str.extract('(\d+)')

consolidated_data['GENDER'] = consolidated_data['GENDER_coded'].map({1: "MALE", 2: "FEMALE"})

# Save
consolidated_data.to_csv("demographics.csv")
