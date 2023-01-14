-- CreateIndex
CREATE FULLTEXT INDEX `Message_text_idx` ON `Message`(`text`) WITH PARSER ngram;
