from dataclasses import dataclass, field


@dataclass
class RuntimeState:
    registered_evaluation_keys: dict[str, str] = field(default_factory=dict)


runtime_state = RuntimeState()

