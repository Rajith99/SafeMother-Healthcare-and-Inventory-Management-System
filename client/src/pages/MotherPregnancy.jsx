import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import Alert from "../components/ui/Alert";
import ConfirmModal from "../components/ui/ConfirmModal";
import PregnancyCard from "../components/pregnancy/PregnancyCard";
import PregnancyForm, {
  mapPregnancyToFormValues,
} from "../components/pregnancy/PregnancyForm";
import PregnancyDetails from "../components/pregnancy/PregnancyDetails";
import UserSearchSelect from "../components/pregnancy/UserSearchSelect";
import { pregnancyService } from "../api/pregnancyApi";
import { userService } from "../api/userApi";
import { MOTHER_NAV } from "../config/navConfig";

function parseApiError(error, fallbackMessage) {
  if (error?.response?.data?.message) return error.response.data.message;
  if (
    Array.isArray(error?.response?.data?.errors) &&
    error.response.data.errors.length > 0
  ) {
    return error.response.data.errors.join(" ");
  }
  return fallbackMessage;
}

export default function MotherPregnancy() {
  const [pregnancies, setPregnancies] = useState([]);
  const [selectedPregnancy, setSelectedPregnancy] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDetailsView, setShowDetailsView] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [assigningDoctor, setAssigningDoctor] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const hasActivePregnancy = useMemo(
    () => pregnancies.some((item) => item.status === "ACTIVE"),
    [pregnancies],
  );

  const { activePregnancies, nonActivePregnancies } = useMemo(() => {
    const active = pregnancies.filter((item) => item.status === "ACTIVE");
    const nonActive = pregnancies.filter((item) => item.status !== "ACTIVE");
    return {
      activePregnancies: active,
      nonActivePregnancies: nonActive,
    };
  }, [pregnancies]);

  const fetchPregnancies = useCallback(async () => {
    setLoadingList(true);
    setError(null);
    try {
      const res = await pregnancyService.listMine();
      const items = res.data?.data ?? [];
      setPregnancies(items);

      if (!items.length) {
        setSelectedPregnancy(null);
        setShowDetailsView(false);
        return;
      }

      if (selectedPregnancy?._id) {
        const matched = items.find(
          (item) => item._id === selectedPregnancy._id,
        );
        if (matched) {
          setSelectedPregnancy(matched);
        }
      }
    } catch (err) {
      setError(parseApiError(err, "Failed to load pregnancies."));
    } finally {
      setLoadingList(false);
    }
  }, [selectedPregnancy?._id]);

  useEffect(() => {
    fetchPregnancies();
  }, [fetchPregnancies]);

  const openDetails = (pregnancy) => {
    setSelectedPregnancy(pregnancy);
    if (pregnancy?.doctor && typeof pregnancy.doctor === "object") {
      setSelectedDoctor(pregnancy.doctor);
    } else {
      setSelectedDoctor(null);
    }
    setShowCreateForm(false);
    setShowEditForm(false);
    setShowDetailsView(true);
  };

  const handleCreate = async (payload) => {
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await pregnancyService.create(payload);
      const created = res.data?.data;
      setSuccessMessage("Pregnancy record created successfully.");
      setShowCreateForm(false);
      await fetchPregnancies();
      if (created?._id) {
        openDetails(created);
      }
    } catch (err) {
      setError(parseApiError(err, "Failed to create pregnancy record."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (payload) => {
    if (!selectedPregnancy?._id) return;
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await pregnancyService.update(selectedPregnancy._id, payload);
      setSelectedPregnancy(res.data?.data);
      openDetails(res.data?.data);
      setSuccessMessage("Pregnancy details updated successfully.");
      setShowEditForm(false);
      fetchPregnancies();
    } catch (err) {
      setError(parseApiError(err, "Failed to update pregnancy details."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignDoctor = async () => {
    if (!selectedPregnancy?._id || !selectedDoctor?._id) return;

    setAssigningDoctor(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await pregnancyService.assignDoctor(
        selectedPregnancy._id,
        selectedDoctor._id,
      );
      setSelectedPregnancy(res.data?.data);
      openDetails(res.data?.data);
      setSuccessMessage("Doctor assigned successfully.");
      fetchPregnancies();
    } catch (err) {
      setError(parseApiError(err, "Failed to assign doctor."));
    } finally {
      setAssigningDoctor(false);
    }
  };

  const searchDoctors = useCallback(async (query) => {
    const res = await userService.searchDoctors(query, 10);
    return res.data?.data ?? [];
  }, []);

  const handleOpenCancelConfirm = () => {
    if (!selectedPregnancy?._id || cancelling) return;
    setShowCancelConfirm(true);
  };

  const handleCancelPregnancy = async () => {
    if (!selectedPregnancy?._id) return;

    setCancelling(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await pregnancyService.cancel(selectedPregnancy._id);
      setSuccessMessage("Pregnancy record cancelled successfully.");
      setShowCancelConfirm(false);
      setShowEditForm(false);
      setShowDetailsView(false);
      setSelectedPregnancy(null);
      fetchPregnancies();
    } catch (err) {
      setError(parseApiError(err, "Failed to cancel pregnancy."));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <DashboardLayout navItems={MOTHER_NAV}>
      <div className="w-full mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text">
              Pregnancy
            </h1>
            <p className="mt-1 text-sm text-text-secondary dark:text-text-muted">
              Manage your pregnancy profile, assignments, and medical details.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchPregnancies}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border dark:border-dark-border text-text-secondary dark:text-dark-text hover:bg-primary/8 hover:text-primary transition-colors"
            >
              <RefreshCw size={15} />
              Refresh
            </button>

            {!hasActivePregnancy && !showCreateForm && (
              <button
                onClick={() => {
                  setShowCreateForm(true);
                  setShowEditForm(false);
                  setShowDetailsView(false);
                }}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                New Pregnancy
              </button>
            )}
          </div>
        </header>

        {error && <Alert type="error">{error}</Alert>}
        {successMessage && <Alert type="success">{successMessage}</Alert>}

        {showCreateForm ? (
          <section className="rounded-xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface p-6">
            <h2 className="text-lg font-semibold text-text-primary dark:text-dark-text">
              Create Pregnancy Record
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Fill the details below to start tracking your pregnancy.
            </p>
            <div className="mt-5">
              <PregnancyForm
                submitLabel="Create Pregnancy"
                submitting={submitting}
                onSubmit={handleCreate}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          </section>
        ) : showEditForm && selectedPregnancy ? (
          <section className="rounded-xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface p-6">
            <h2 className="text-lg font-semibold text-text-primary dark:text-dark-text">
              Edit Pregnancy Details
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Update your information. Metrics are recalculated automatically
              when needed.
            </p>
            <div className="mt-5">
              <PregnancyForm
                initialValues={mapPregnancyToFormValues(selectedPregnancy)}
                submitLabel="Save Changes"
                submitting={submitting}
                onSubmit={handleUpdate}
                onCancel={() => setShowEditForm(false)}
              />
            </div>
          </section>
        ) : showDetailsView && selectedPregnancy ? (
          <div className="space-y-4">
            <button
              onClick={() => {
                setShowDetailsView(false);
                setSelectedPregnancy(null);
              }}
              className="px-4 py-2 rounded-lg border border-border dark:border-dark-border text-sm font-medium text-text-secondary dark:text-dark-text hover:bg-bg-card dark:hover:bg-dark-surface transition-colors"
            >
              Back to Records
            </button>

            <PregnancyDetails pregnancy={selectedPregnancy} />

            {selectedPregnancy.status === "ACTIVE" && (
              <section className="rounded-xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface p-5">
                <h3 className="text-base font-semibold text-text-primary dark:text-dark-text">
                  Actions
                </h3>

                <div className="mt-4 flex flex-col md:flex-row gap-3">
                  <button
                    onClick={() => setShowEditForm(true)}
                    className="px-4 py-2 rounded-lg border border-border dark:border-dark-border text-sm font-medium text-text-secondary dark:text-dark-text hover:bg-bg-main dark:hover:bg-dark-bg transition-colors"
                  >
                    Edit Details
                  </button>

                  <button
                    onClick={handleOpenCancelConfirm}
                    disabled={cancelling}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-red-200 dark:border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    {cancelling ? "Cancelling..." : "Cancel Pregnancy"}
                  </button>
                </div>

                <div className="mt-5 border-t border-border dark:border-dark-border pt-4">
                  <h4 className="text-sm font-semibold text-text-primary dark:text-dark-text">
                    Assign Doctor
                  </h4>
                  <p className="mt-1 text-xs text-text-muted">
                    Search active doctors by name and select one.
                  </p>
                  <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:items-end">
                    <div className="flex-1">
                      <UserSearchSelect
                        label="Doctor"
                        placeholder="Search doctor by name"
                        selectedUser={selectedDoctor}
                        onSelect={setSelectedDoctor}
                        searchUsers={searchDoctors}
                        noResultsText="No active doctors found."
                      />
                    </div>
                    <button
                      onClick={handleAssignDoctor}
                      disabled={!selectedDoctor?._id || assigningDoctor}
                      className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      {assigningDoctor ? "Assigning..." : "Assign Doctor"}
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>
        ) : (
          <section>
            <div className="mb-4">
              <h2 className="text-base font-semibold text-text-primary dark:text-dark-text">
                Your Records
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                Click a card to view full pregnancy details.
              </p>
            </div>

            {loadingList && (
              <div className="rounded-xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface p-6 text-sm text-text-muted">
                Loading pregnancies...
              </div>
            )}

            {!loadingList && pregnancies.length === 0 && (
              <div className="rounded-xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface p-6 text-sm text-text-muted">
                No pregnancy records found.
              </div>
            )}

            {!loadingList &&
              pregnancies.length > 0 &&
              (activePregnancies.length > 0 ? (
                <div className="space-y-6">
                  <section>
                    <h3 className="text-sm font-semibold text-text-primary dark:text-dark-text mb-3">
                      Active
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {activePregnancies.map((pregnancy) => (
                        <PregnancyCard
                          key={pregnancy._id}
                          pregnancy={pregnancy}
                          onClick={openDetails}
                        />
                      ))}
                    </div>
                  </section>

                  {nonActivePregnancies.length > 0 && (
                    <section>
                      <h3 className="text-sm font-semibold text-text-primary dark:text-dark-text mb-3">
                        Completed
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {nonActivePregnancies.map((pregnancy) => (
                          <PregnancyCard
                            key={pregnancy._id}
                            pregnancy={pregnancy}
                            onClick={openDetails}
                          />
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {pregnancies.map((pregnancy) => (
                    <PregnancyCard
                      key={pregnancy._id}
                      pregnancy={pregnancy}
                      onClick={openDetails}
                    />
                  ))}
                </div>
              ))}
          </section>
        )}
      </div>

      <ConfirmModal
        isOpen={showCancelConfirm}
        onConfirm={handleCancelPregnancy}
        onCancel={() => setShowCancelConfirm(false)}
        title="Confirm Cancellation"
        message="Are you sure you want to cancel this pregnancy record? This action cannot be undone."
        confirmLabel="Yes, Cancel"
        cancelLabel="Keep Record"
        isConfirming={cancelling}
      />
    </DashboardLayout>
  );
}
