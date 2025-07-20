from pydantic import BaseModel
from typing import List, Literal, Optional

class TextBlock(BaseModel):
    type: Literal['paragraph', 'heading', 'list', 'quote']
    text: str

class StructureMetrics(BaseModel):
    headings: int
    lists: int
    bold_instances: int
    italic_instances: int
    links: int
    images: int
    tables: int
    footnotes: int

class Metadata(BaseModel):
    filename: str
    filetype: Literal['txt', 'pdf', 'docx']
    language: Optional[str]
    char_count: int
    word_count: int

class NLPRequest(BaseModel):
    metadata: Metadata
    structure: StructureMetrics
    text_blocks: List[TextBlock]
