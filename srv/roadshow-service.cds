service RoadshowService {
    function getRagResponse() returns String;
    function executeSimilaritySearch() returns array of {
        text_chunk: String;
        cosine_similarity: Decimal;
        l2Distance: Decimal;
    };
}