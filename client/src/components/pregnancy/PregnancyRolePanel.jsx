import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { pregnancyService } from "../../api/pregnancyApi";
import { userService } from "../../api/userApi";
import Alert from "../ui/Alert";
import PregnancyCard from "./PregnancyCard";
import PregnancyDetails from "./PregnancyDetails";
import UserSearchSelect from "./UserSearchSelect";

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

export default function PregnancyRolePanel({
  title,
  description,
  allowAssignMidwife = false,
}) {
  const [pregnancies, setPregnancies] = useState([]);
  const [selectedPregnancy, setSelectedPregnancy] = useState(null);
  const [selectedMidwife, setSelectedMidwife] = useState(null);
  const [showDetailsView, setShowDetailsView] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [submittingMidwife, setSubmittingMidwife] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

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

  const openDetails = async (pregnancy) => {
    setError(null);
    try {
      const res = await pregnancyService.getById(pregnancy._id);
      const details = res.data?.data;
      setSelectedPregnancy(details);
      if (details?.midwife && typeof details.midwife === "object") {
        setSelectedMidwife(details.midwife);
      } else {
        setSelectedMidwife(null);
      }
      setShowDetailsView(true);
    } catch (err) {
      setError(parseApiError(err, "Failed to load pregnancy details."));
    }
  };

  const handleAssignMidwife = async () => {
    if (!selectedPregnancy?._id || !selectedMidwife?._id) return;
    setSubmittingMidwife(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await pregnancyService.assignMidwife(
        selectedPregnancy._id,
        selectedMidwife._id,
      );
      setSelectedPregnancy(res.data?.data);
      setShowDetailsView(true);
      setSuccessMessage("Midwife assigned successfully.");
      fetchPregnancies();
    } catch (err) {
      setError(parseApiError(err, "Failed to assign midwife."));
    } finally {
      setSubmittingMidwife(false);
    }
  };

  const searchMidwives = useCallback(async (query) => {
    const res = await userService.searchMidwives(query, 10);
    return res.data?.data ?? [];
  }, []);

  return (
    <div className="w-full">
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text">
            {title}
          </h1>
          <p className="mt-1 text-sm text-text-secondary dark:text-text-muted">
            {description}
          </p>
        </div>
        <button
          onClick={fetchPregnancies}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border dark:border-dark-border text-text-secondary dark:text-dark-text hover:bg-primary/8 hover:text-primary transition-colors self-start sm:self-auto"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </header>

      {error && <Alert type="error">{error}</Alert>}
      {successMessage && <Alert type="success">{successMessage}</Alert>}

      {showDetailsView && selectedPregnancy ? (
        <div className="space-y-4">
          <button
            onClick={() => {
              setShowDetailsView(false);
              setSelectedPregnancy(null);
              setSelectedMidwife(null);
            }}
            className="px-4 py-2 rounded-lg border border-border dark:border-dark-border text-sm font-medium text-text-secondary dark:text-dark-text hover:bg-bg-card dark:hover:bg-dark-surface transition-colors"
          >
            Back to Records
          </button>

          <PregnancyDetails pregnancy={selectedPregnancy} />

          {allowAssignMidwife && selectedPregnancy.status === "ACTIVE" && (
            <section className="rounded-xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface p-5">
              <h3 className="text-base font-semibold text-text-primary dark:text-dark-text">
                Assign Midwife
              </h3>
              <p className="mt-1 text-sm text-text-muted">
                Search active midwives by name. Only the assigned doctor can
                perform this action.
              </p>

              <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:items-end">
                <div className="flex-1">
                  <UserSearchSelect
                    label="Midwife"
                    placeholder="Search midwife by name"
                    selectedUser={selectedMidwife}
                    onSelect={setSelectedMidwife}
                    searchUsers={searchMidwives}
                    noResultsText="No active midwives found."
                  />
                </div>
                <button
                  onClick={handleAssignMidwife}
                  disabled={!selectedMidwife?._id || submittingMidwife}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {submittingMidwife ? "Assigning..." : "Assign Midwife"}
                </button>
              </div>
            </section>
          )}
        </div>
      ) : (
        <section>
          <div className="mb-4">
            <h2 className="text-base font-semibold text-text-primary dark:text-dark-text">
              Assigned Pregnancies
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
              No assigned pregnancies found.
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
                        showOwner
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
                          showOwner
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
                    showOwner
                  />
                ))}
              </div>
            ))}
        </section>
      )}
    </div>
  );
}
