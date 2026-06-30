from pydantic import BaseModel
from typing import List, Optional

class VideoMetadata(BaseModel):
    filename: str
    pov_text: str
    caption_text: str

class MetadataList(BaseModel):
    items: List[VideoMetadata]

class JobStatus(BaseModel):
    job_id: str
    total: int
    processed: int
    failed: int
    status: str
    message: str

class VideoStatus(BaseModel):
    filename: str
    status: str
    exists_output: bool
    video_url: Optional[str] = None
    caption_url: Optional[str] = None
    cover_url: Optional[str] = None
    pov_text: Optional[str] = None
    caption_text: Optional[str] = None
    input_preview_url: Optional[str] = None
    output_preview_url: Optional[str] = None
    has_output: bool = False

class ApplyRandomRequest(BaseModel):
    overwrite: bool = False

class PhraseItem(BaseModel):
    id: int
    pov_text: str
    caption_text: str
    categoria: Optional[str] = None
    tom: Optional[str] = None
    ativo: str = "Sim"

class PhraseListResponse(BaseModel):
    phrases: List[PhraseItem]
    total: int
    active: int

class UploadPhrasesResponse(BaseModel):
    success: bool
    total: int
    active: int

class ProfileSettings(BaseModel):
    display_name: str
    handle: str
    verified: bool = True
    logo_path: Optional[str] = None
    has_custom_profile: bool = False


