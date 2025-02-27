namespace cap.vector;
using { cuid } from '@sap/cds/common';

entity DocumentChunk: cuid {
    text_chunk: LargeString;
    metadata_column: LargeString;
    embedding: Vector(1536);
}