import pandas as pd
import os

# os.chdir('D:\\RA - Spring 2024\\Gorilla Data\\raw_data')
os.chdir('/courses/RA - Spring 2024/Gorilla Data')
video_data_recog = pd.read_csv("metadata/video_data_recog.csv")
video_data_iden = pd.read_csv("metadata/video_data_iden.csv")

grouped_recog = video_data_recog.groupby(["stimuli", "trial.number", "ppn", "CINT"])
grouped_iden = video_data_iden.groupby(["stimuli", "trial.number", "ppn", "CINT"])

def sum_unique(series):
    return series.unique().sum()

# Aggregating recognition video data
summed_data_recog = grouped_recog.agg({
    'reaction.recog': sum_unique,
}).reset_index()
summed_data_recog.head()
summed_data_recog.to_csv("metadata/recog_flat.csv", index=False)
print("Recognition data flattened!")

# Aggregating identification video data
summed_data_iden = grouped_iden.agg({
    'reaction.iden': sum_unique
}).reset_index()
summed_data_iden.head()
summed_data_iden.to_csv("metadata/iden_flat.csv", index=False)
print("Identification data flattened!")