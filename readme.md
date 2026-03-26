# SmartClass Test Structure

esp/
├── conftest.py
├── esp/
│   ├── tests/
│   │   ├── factories.py
│   │   ├── base.py
│   │   ├── test_context_processors.py
│   │   ├── test_middleware.py
│   │   └── test_middleware_error.py
│   ├── program/
│   │   ├── tests.py
│   │   ├── test_statistics.py
│   │   ├── test_views.py
│   │   └── modules/tests/
│   │       ├── conftest.py
│   │       ├── test_scheduling_checks.py
│   │       ├── test_student_reg_twophase.py
│   │       ├── test_student_class_reg.py
│   │       ├── test_admin_core.py
│   │       ├── test_bigboard.py
│   │       ├── test_json_data.py
│   │       └── test_comm.py
│   ├── users/
│   │   ├── tests.py
│   │   └── test_autocomplete.py
│   ├── web/
│   │   ├── tests.py
│   │   └── test_views.py
│   ├── themes/
│   │   └── test_themes.py
│   ├── middleware/
│   │   └── test_middleware.py
│   └── seltests/
│       ├── seltests.py
│       └── page_objects.py