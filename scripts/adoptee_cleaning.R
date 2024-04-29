# This R file contains code to read and clean csv outputs from Gorilla
library(tidyverse)
library(readr)
library(vroom)
# Read files 
setwd("/courses/RA - Spring 2024/Gorilla Data")
# Recognition data
df_recog <- read.csv("raw_data/emotion_recog.csv", header=TRUE)
# Identification data
df_iden <- read.csv("raw_data/emotion_iden.csv", header=TRUE)
# Demographics 
demographics <- read.csv("raw_data/demographics.csv", header=TRUE)


# Merge csvs by ppn id and stimuli
all_data <- df_recog %>% right_join(df_iden, by=c("Trial.Number", 'Participant.Private.ID', "emotion", "stimuli", "culture"), relationship = "many-to-many")
response_data <- all_data[all_data$Zone.Type.x != "content_video" & all_data$Zone.Type.y != "content_video" & all_data$Zone.Type.y != "continue_button",]
video_data <- all_data[all_data$Zone.Type.x == "content_video" & all_data$Zone.Type.y == "content_video",]

# Write Video_data
## Recognition
video_data_recog <- df_recog[df_recog$Zone.Type == "content_video" & df_recog$Zone.Type == "content_video",]
video_df_recog <- data.frame(ppn = video_data_recog$Participant.Private.ID,
                      reaction.recog = video_data_recog$Reaction.Time,
                      # reaction.iden = video_data_recog$Reaction.Time.y,
                      trial.number = video_data_recog$Trial.Number,
                      stimuli = video_data_recog$stimuli,
                      CINT = video_data_recog$Participant.Public.ID)


## Identification
video_data_iden <- df_iden[df_iden$Zone.Type == "content_video" & df_iden$Zone.Type == "content_video",]
video_df_iden <- data.frame(ppn = video_data_iden$Participant.Private.ID,
                             reaction.iden = video_data_iden$Reaction.Time,
                             # reaction.iden = video_data_iden$Reaction.Time.y,
                             trial.number = video_data_iden$Trial.Number,
                             stimuli = video_data_iden$stimuli,
                            CINT = video_data_iden$Participant.Public.ID)


write.csv(video_df_recog, "metadata/video_data_recog.csv")
write.csv(video_df_iden, "metadata/video_data_iden.csv")

print("CSVs for video data created")

# Recognition Data
# video_data <- response_data[response_data$`Zone Type` == "content_video",] 
# video_data_id <- df_iden[df_iden$Zone.Type == "content_video",] 
# response_data$response <- df_recog[df_recog$`Zone Type` == "response_button_text",]
# response_data$accuracy <- response_data$ANSWER.x == response_data$Response.x
# Identification data 
# response_data_id <- df_iden[df_iden$Zone.Type == "response_rating_scale_likert_active",] 

# a cleaner dataframe
response_data$accuracy <- response_data$Response.x == response_data$ANSWER.CHINESE.x


# Data.frame with responses from both Identification and Recognition
likert_1 <- subset(response_data, Zone.Name.y %in% 'Zone2')
likert_2 <- subset(response_data, Zone.Name.y %in% 'Zone5')



clean_df <- data.frame(ppn = likert_1$Participant.Private.ID,
                       ppn2 = likert_2$Participant.Private.ID,
                       trial = likert_1$Trial.Number,
                       trial.number2 = likert_2$Trial.Number,
                       response = likert_1$Response.x,
                       answer = likert_1$ANSWER.CHINESE.x,
                       accuracy = likert_1$accuracy,
                       emotion = likert_1$ANSWER.ENGLISH.x,
                       culture = likert_1$culture,
                       stimuli = likert_1$stimuli,
                       likert1 = likert_1$Response.y,
                       likert2 = likert_2$Response.y)

# Save data
na.omit(clean_df)
write.csv(clean_df,"new_csv/preprocessed_data.csv")

print("Preprocessed csv created")

# Demographics
subsetted_demo <- data.frame(Participant.Private.ID = demographics$Participant.Private.ID,
                             Question.Key = demographics$Question.Key,
                             Response = demographics$Response)

# Choose demographic info to pivot
age_df <- subset(subsetted_demo, subsetted_demo$Question.Key == "age") %>%
  select(-Question.Key) %>%
  rename(age = Response)

gender_df <- subset(subsetted_demo, subsetted_demo$Question.Key == "gender") %>%
  select(-Question.Key) %>%
  rename(gender = Response)


eth_df <- subset(subsetted_demo, subsetted_demo$Question.Key == "ethnicity") %>%
  select(-Question.Key) %>%
  rename(ethnicity = Response)

birth_df <- subset(subsetted_demo, subsetted_demo$Question.Key == "birthplace") %>%
  select(-Question.Key) %>%
  rename(birthplace = Response)

clean_demo <- age_df %>% 
  right_join(gender_df, by=c('Participant.Private.ID')) %>% 
  right_join(eth_df, by=c('Participant.Private.ID')) %>% 
  right_join(birth_df, by=c('Participant.Private.ID'))  



# # Pivot data
# data <- subsetted_demo %>%
#   group_by(Participant.Private.ID) %>%
#   mutate(row = row_number()) 
# 
# # Pivot the dataframe, allowing for duplicates
# pivoted_data <- data %>%
#   pivot_wider(
#     names_from = c(Question.Key, row),
#     values_from = Response,
#     values_fn = ~1, values_fill = 0)
#   )

write.csv(clean_demo, 'new_csv/prelim_demo.csv')
print('Demographics csv created')
# data.frame(names = row.names(distinct_demo), distinct_demo)
# d <- cbind(rownames(distinct_demo), data.frame(distinct_demo, row.names=NULL))
# Pivot df with rows as columns
# new_data <- read.csv("preprocessed_adoptee.csv", header=TRUE)
