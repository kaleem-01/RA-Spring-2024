setwd("/courses/RA - Spring 2024/Gorilla Data/")
# ACCEPTED PARTICIPANTS
block_1 <- read.csv("metadata/videos_per_ppn_1.csv", header=TRUE)
block_2 <- read.csv("metadata/videos_per_ppn_2.csv", header=TRUE)

block1_accept <- c(block_1$CINT[block_1$videos >= 12])
block2_accept <- c(block_2$CINT[block_2$videos >= 12])

length(block1_accept)
length(block2_accept)
common= intersect(block1_accept, block2_accept)
length(common)
write_csv(as.data.frame(common), "metadata/accepted_IDs.csv")
