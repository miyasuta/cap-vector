namespace cap.vector;

entity DocumentChunk {
    text_chunk: LargeString;
    metadata_column: LargeString;
    embedding: Vector(1536);
}