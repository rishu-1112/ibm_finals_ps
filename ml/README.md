# Healthcare intelligence models

Run from the repository root:

```powershell
python -m pip install -r ml/requirements.txt
python ml/train_models.py
```

This writes versioned, reproducible model artifacts to `ml/artifacts/`:

- `district_undernutrition_regressor.joblib` — Random Forest prediction of the NFHS district underweight prevalence, using care access, nutrition and living-condition indicators.
- `district_anomaly_detector.joblib` — Isolation Forest flag for unusual district health profiles.
- `state_capacity_segments.joblib` — K-Means segments of states with critical-to-stronger rural-care capacity, using RHS facilities, vacancies, staffing and rural population.
- `birth_weight_classifier.joblib` — Random Forest classifier for the supplied individual birth-weight dataset. Its threshold is selected to prioritise low-birth-weight recall, not overall accuracy.
- `training_report.json` — held-out validation metrics, model features and scope.

## Honest scope

The available NFHS records are district-level and one-period; the RHS files are state-level; no supplied data has a village key linked to health outcomes over time. Therefore these artifacts **must not be presented as trained village forecasts**. Village-level predictions require at least several dated village/facility records containing a village ID and the outcomes to predict (such as undernutrition prevalence, fully-immunized share, visits, stockouts, and staffing).

For an MVP dashboard, calculate transparent infrastructure/service/utilisation scores from the local data, show the district model as a contextual risk signal, and mark village values as `insufficient data` until these records exist.
