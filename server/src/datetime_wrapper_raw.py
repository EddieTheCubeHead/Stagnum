import datetime


class DateTimeWrapperRaw:  # pragma: no cover - we're always mocking this class
    """Wrapper for all datetime functionality. Ensures we can mock now() in testing"""

    def __init__(self) -> None:
        self._timezone = datetime.UTC

    def now(self) -> datetime.datetime:
        return datetime.datetime.now(self._timezone)

    def ensure_utc(self, timestamp: datetime.datetime) -> datetime.datetime:
        return timestamp.replace(tzinfo=self._timezone)
