import { useEffect, useMemo, useState } from "react";
import games from "../data/games";

import {
  deleteGame,
  getGames,
  importGames,
  isLoggedIn,
  isSupabaseConfigured,
  login,
  logout,
  upsertGame,
  updateGame,
  uploadGameImage,
} from "../lib/supabaseRest";
const localGamesById = new Map(
  games.map((game) => [String(game.id), game])
);

const localGamesByName = new Map(
  games.map((game) => [
    game.name.trim().toLowerCase(),
    game,
  ])
);

function resolveAdminGameImage(game) {
  const localGame =
    localGamesById.get(String(game.id)) ||
    localGamesByName.get(
      String(game.name || "").trim().toLowerCase()
    );

  const image = game.image || "";

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  return localGame?.image || image;
}
const emptyForm = {
  id: "",
  name: "",
  image: "",
  imageFile: null,
  platform: "PS4",
  category: "أخرى",
  whatsappOptions: [],
  sort_order: 0,
  is_featured: false,
  is_visible: true,
};

function DashboardRow({ game, onDelete, onSaveOrder, busy }) {
  const [editingOrder, setEditingOrder] = useState(false);
  const [position, setPosition] = useState(String(game.sort_order ?? 1));

  useEffect(() => {
    setPosition(String(game.sort_order ?? 1));
  }, [game.sort_order]);

  return (
    <tr>
<td>
  <img
    className="admin-thumb"
    src={resolveAdminGameImage(game)}
    alt={game.name}
  />
</td>      <td>{game.name}</td>
      <td>{game.platform}</td>
      <td>{game.category}</td>
      <td>
        {editingOrder ? (
          <input
            aria-label={`ترتيب ${game.name}`}
            type="number"
            min="1"
            step="1"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            style={{ width: "85px" }}
          />
        ) : (game.sort_order ?? 0)}
      </td>
      <td className="admin-actions">
        {editingOrder ? (
          <>
            <button disabled={busy} onClick={async () => {
              const ok = await onSaveOrder(game.id, position);
              if (ok) setEditingOrder(false);
            }}>حفظ الترتيب</button>
            <button type="button" disabled={busy} onClick={() => {
              setPosition(String(game.sort_order ?? 1));
              setEditingOrder(false);
            }}>إلغاء</button>
          </>
        ) : (
          <button type="button" disabled={busy} onClick={() => setEditingOrder(true)}>تعديل الترتيب</button>
        )}
        <button className="danger" disabled={busy} onClick={() => onDelete(game.id)}>حذف</button>
      </td>
    </tr>
  );
}

export default function AdminDashboard({ onBack }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [dbGames, setDbGames] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (!loggedIn) return;

    getGames()
      .then((rows) => setDbGames(rows || []))
      .catch((err) => setMessage(err.message));
  }, [loggedIn]);

  // Keep one contact per label/phone, even when old games have game-specific message URLs.
  const availableWhatsappOptions = useMemo(() => {
    const options = [...(dbGames || []), ...(games || [])].flatMap((game) =>
      game.whatsapp_options || game.whatsappOptions || []
    );
    const unique = new Map();
    options.forEach((option) => {
      if (!option?.label || !option?.whatsapp) return;
      try {
        const url = new URL(option.whatsapp);
        const phone = url.pathname.replace(/^\/+/, "");
        if (!phone) return;
        const key = `${option.label}|${phone}`;
        if (!unique.has(key)) unique.set(key, { label: option.label, phone });
      } catch {
        // Ignore malformed legacy WhatsApp links.
      }
    });
    return [...unique.values()];
  }, [dbGames]);

  const filtered = useMemo(
    () =>
      dbGames.filter((g) =>
        g.name.toLowerCase().includes(search.toLowerCase())
      ),
    [dbGames, search]
  );

  if (!isSupabaseConfigured) {
    return (
      <main className="admin-page">
        <section className="admin-panel">
          <button className="back-btn" onClick={onBack}>
            ← الموقع
          </button>

          <h1>Yousef Store Dashboard</h1>

          <div className="admin-notice">
            <h2>الـ Dashboard جاهز، لكن قاعدة البيانات لسه مش متوصلة.</h2>
            <p>
              بعد إنشاء مشروع Supabase، هنضيف VITE_SUPABASE_URL و
              VITE_SUPABASE_PUBLISHABLE_KEY في Vercel.
            </p>
            <p>
              مهم: لا تضع Service Role Key داخل المشروع أو Vercel Frontend.
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (!loggedIn) {
    return (
      <main className="admin-page admin-login-page">
        <div className="admin-login-bg-glow glow-one" />
        <div className="admin-login-bg-glow glow-two" />

        <section className="admin-login admin-login-card">
          <button className="back-btn login-back" onClick={onBack}>
            ← العودة للموقع
          </button>

          <div className="login-brand">
            <div className="login-logo-wrap">
              <img
                src="/logo.png.png"
                alt="Yousef Store"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <span>🎮</span>
            </div>

            <div>
              <div className="login-brand-name">
                YOUSEF <b>STORE</b>
              </div>
              <div className="login-brand-sub">ADMIN CONTROL PANEL</div>
            </div>
          </div>

          <div className="login-heading">
            <span className="login-lock">🔐</span>
            <div>
              <h1>دخول الإدارة</h1>
              <p>سجّل دخولك لإدارة الألعاب والمحتوى</p>
            </div>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();

              setBusy(true);
              setMessage("");

              try {
                await login(email, password);
                setLoggedIn(true);
              } catch (err) {
                setMessage(err.message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <label className="login-field">
              <span>البريد الإلكتروني</span>

              <div className="login-input-wrap">
                <span>✉️</span>

                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="admin@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            <label className="login-field">
              <span>كلمة المرور</span>

              <div className="login-input-wrap">
                <span>🔒</span>

                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </label>

            <button className="login-submit" disabled={busy}>
              <span>
                {busy ? "جاري التحقق..." : "دخول إلى لوحة التحكم"}
              </span>
              <span>→</span>
            </button>
          </form>

          {message && (
            <div className="admin-error login-error">
              ⚠️ {message}
            </div>
          )}

          <div className="login-security">
            🛡️ اتصال آمن • صلاحيات الإدارة محمية
          </div>
        </section>
      </main>
    );
  }

 const save = async (e) => {
  e.preventDefault();

  if (!form.name.trim()) {
    return setMessage("اكتب اسم اللعبة.");
  }

  if (!form.image.trim() && !form.imageFile) {
    return setMessage("اختار صورة اللعبة.");
  }

  setBusy(true);
  setMessage("");

  try {
    let imageUrl = form.image.trim();

    if (form.imageFile) {
      imageUrl = await uploadGameImage(form.imageFile);
    }

    const isEditing = Boolean(form.id);

    const payload = {
      name: form.name.trim(),
      image: imageUrl,
      platform: form.platform.trim() || "PS4",
      category: form.category.trim() || "أخرى",
      whatsapp_options: form.whatsappOptions.map((option) => ({
        label: option.label,
        whatsapp: `https://wa.me/${option.phone}?text=${encodeURIComponent(`أريد شراء لعبة ${form.name.trim()}`)}`,
      })),
      sort_order: Number(form.sort_order) || 0,
      is_featured: Boolean(form.is_featured),
      is_visible: Boolean(form.is_visible),
    };

    let saved;

    if (isEditing) {
      // تعديل لعبة موجودة: UPDATE فقط
      const result = await updateGame(form.id, payload);

      saved = result?.[0] || {
        id: form.id,
        ...payload,
      };
    } else {
      // إضافة لعبة جديدة: INSERT
      const newGame = {
        id: Date.now(),
        ...payload,
      };

      const result = await upsertGame(newGame);

      saved = result?.[0] || newGame;
    }

    setDbGames((prev) =>
      [
        ...prev.filter((g) => g.id !== saved.id),
        saved,
      ].sort(
        (a, b) =>
          (Number(a.sort_order) || 0) -
            (Number(b.sort_order) || 0) ||
          a.name.localeCompare(b.name)
      )
    );

    setForm(emptyForm);
    setImagePreview("");

    setMessage(
      isEditing
        ? "تم تعديل اللعبة بنجاح ✅"
        : "تم إضافة اللعبة ورفع الصورة ✅"
    );
  } catch (err) {
    setMessage(err.message);
  } finally {
    setBusy(false);
  }
};

const seed = async () => {
  setBusy(true);
  setMessage("");

  try {
    // الألعاب الموجودة حاليًا في Supabase
    const existingGames = await getGames();

    const existingIds = new Set(
      (existingGames || []).map((game) => String(game.id))
    );

    // الألعاب الموجودة في المشروع المحلي
    const payload = games
      .filter((g) => !existingIds.has(String(g.id)))
      .map((g) => ({
        id: g.id,
        name: g.name,
        image: g.image,
        platform: g.platform,
        category: g.category,
        whatsapp_options: g.whatsappOptions || [],
        sort_order: Number(g.sort_order) || g.id,
        is_featured: Boolean(g.is_featured),
        is_visible: true,
      }));

    // نضيف الألعاب الناقصة فقط
    if (payload.length > 0) {
      await importGames(payload);
    }

    // نجيب القائمة كاملة من Supabase بعد الاستيراد
    const updatedGames = await getGames();

    setDbGames(updatedGames || []);

    setMessage(
      payload.length > 0
        ? `تم استيراد ${payload.length} لعبة جديدة بدون حذف الألعاب الموجودة ✅`
        : "كل الألعاب موجودة بالفعل، ولم يتم حذف أي لعبة ✅"
    );
  } catch (err) {
    setMessage(err.message);
  } finally {
    setBusy(false);
  }
};

const moveGame = async (id, direction) => {
  try {
    setBusy(true);
    setMessage("");

    const game = dbGames.find((g) => g.id === id);

    if (!game) return;

    const currentOrder = Number(game.sort_order) || 0;

    // ↑ يزيد 1
    // ↓ يقل 1
    const newOrder = currentOrder - direction;

    await upsertGame({
      ...game,
      sort_order: newOrder,
    });

    setDbGames((prev) =>
      prev.map((g) =>
        g.id === id
          ? { ...g, sort_order: newOrder }
          : g
      )
    );

    setMessage("تم تعديل الترتيب ✅");
  } catch (err) {
    setMessage(err.message);
  } finally {
    setBusy(false);
  }
};

  const saveOrder = async (id, requestedValue) => {
    setBusy(true);
    setMessage("");

    const previousGames = dbGames;
    let ordered = [];

    try {
      ordered = [...dbGames].sort((a, b) =>
        (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0) ||
        String(a.name || "").localeCompare(String(b.name || ""))
      );

      const currentIndex = ordered.findIndex((g) => String(g.id) === String(id));
      if (currentIndex < 0) throw new Error("مش لاقي اللعبة في القائمة.");

      const [target] = ordered.splice(currentIndex, 1);
      const requestedPosition = Math.max(
        1,
        Math.min(ordered.length + 1, Math.trunc(Number(requestedValue) || 1))
      );
      ordered.splice(requestedPosition - 1, 0, target);

      // حدّث الجدول فورًا حتى تقدر تكمل من غير Refresh.
      const reorderedGames = ordered.map((g, index) => ({ ...g, sort_order: index + 1 }));
      setDbGames(reorderedGames);
      setMessage("جاري حفظ الترتيب...");

      // احفظ التغييرات بالتوازي بدل انتظار كل طلب لوحده.
      await Promise.all(
        reorderedGames
          .filter((game, index) => {
            const previous = previousGames.find(
              (item) => String(item.id) === String(game.id)
            );
            return Number(previous?.sort_order ?? 0) !== game.sort_order;
          })
          .map((game) =>
            updateGame(game.id, { sort_order: game.sort_order })
          )
      );

      setMessage("تم حفظ الترتيب ✅ تقدر تكمل تعديل باقي الألعاب.");
      return true;
    } catch (err) {
      // لو الحفظ فشل، رجّع القائمة للحالة السابقة وحاول جلب آخر بيانات محفوظة.
      setDbGames(previousGames);
      try {
        const latestGames = await getGames();
        setDbGames(latestGames || previousGames);
      } catch {
        // سيب رسالة الخطأ الأصلية ظاهرة.
      }
      setMessage(err.message || "حصل خطأ أثناء حفظ الترتيب");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("متأكد إنك عايز تحذف اللعبة؟")) return;

    setBusy(true);
    setMessage("");

    try {
      await deleteGame(id);

      setDbGames((prev) =>
        prev.filter((g) => g.id !== id)
      );

      setMessage("تم الحذف ✅");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="admin-page">
      <section className="admin-panel wide">
        <div className="admin-topbar">
          <div>
            <button className="back-btn" onClick={onBack}>
              ← الموقع
            </button>

            <h1>Dashboard</h1>
          </div>

          <button
            className="logout-btn"
            onClick={() => {
              logout();
              setLoggedIn(false);
            }}
          >
            تسجيل خروج
          </button>
        </div>

        <div className="admin-stats">
          <div>
            <strong>{dbGames.length}</strong>
            <span>الألعاب</span>
          </div>

          <div>
            <strong>∞</strong>
            <span>إدارة المحتوى</span>
          </div>

          <div>
            <strong>🟢</strong>
            <span>Database</span>
          </div>
        </div>

        <div className="admin-toolbar">
          <button
            className="primary-btn"
            onClick={seed}
            disabled={busy}
          >
            استيراد الألعاب الحالية
          </button>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن لعبة..."
          />
        </div>

        <form className="game-form" onSubmit={save}>
          <h2>{form.id ? "تعديل لعبة" : "إضافة لعبة"}</h2>

          <input
            placeholder="اسم اللعبة"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
            required
          />

          <div className="image-upload-field">
            <label className="file-label">
              <span>📷 اختيار صورة اللعبة</span>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;

                  setForm({
                    ...form,
                    imageFile: file,
                  });

                  if (file) {
                    setImagePreview(
                      URL.createObjectURL(file)
                    );
                  }
                }}
              />
            </label>

            <small>
              {form.imageFile
                ? form.imageFile.name
                : "PNG / JPG / WEBP — بحد أقصى 5MB"}
            </small>

            {(imagePreview || form.image) && (
              <img
                className="upload-preview"
                src={imagePreview || form.image}
                alt="معاينة الصورة"
              />
            )}
          </div>

          <input
            placeholder="Platform"
            value={form.platform}
            onChange={(e) =>
              setForm({
                ...form,
                platform: e.target.value,
              })
            }
          />

          <input
            placeholder="Category"
            value={form.category}
            onChange={(e) =>
              setForm({
                ...form,
                category: e.target.value,
              })
            }
          />

          <fieldset className="whatsapp-options-field" style={{ border: "1px solid #334155", borderRadius: "10px", padding: "12px", margin: "12px 0" }}>
            <legend>اختيارات الطلب عبر واتساب</legend>
            {availableWhatsappOptions.length ? (
              availableWhatsappOptions.map((option) => {
                const checked = form.whatsappOptions.some(
                  (selected) => selected.label === option.label && selected.phone === option.phone
                );
                return (
                  <label className="check-row" key={`${option.label}|${option.phone}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const nextOptions = e.target.checked
                          ? [...form.whatsappOptions.filter((item) => !(item.label === option.label && item.phone === option.phone)), option]
                          : form.whatsappOptions.filter((item) => !(item.label === option.label && item.phone === option.phone));
                        setForm({ ...form, whatsappOptions: nextOptions });
                      }}
                    />
                    {option.label}
                  </label>
                );
              })
            ) : (
              <p>مش لاقي اختيارات واتساب محفوظة في الألعاب القديمة. لازم تضيف اختيار واتساب واحد على الأقل في بيانات لعبة موجودة أولًا.</p>
            )}
          </fieldset>

          <label className="field-label">
            ترتيب اللعبة

            <input
              type="number"
              min="0"
              value={form.sort_order}
              onChange={(e) =>
                setForm({
                  ...form,
                  sort_order: e.target.value,
                })
              }
            />
          </label>

          <label className="check-row">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) =>
                setForm({
                  ...form,
                  is_featured: e.target.checked,
                })
              }
            />
            ⭐ لعبة مميزة
          </label>

          <label className="check-row">
            <input
              type="checkbox"
              checked={form.is_visible}
              onChange={(e) =>
                setForm({
                  ...form,
                  is_visible: e.target.checked,
                })
              }
            />
            👁️ إظهار اللعبة على الموقع
          </label>

          <div className="form-buttons">
            <button
              className="primary-btn"
              disabled={busy}
            >
              {busy ? "حفظ..." : "حفظ اللعبة"}
            </button>

            <button
              type="button"
              onClick={() => {
                setForm(emptyForm);
                setImagePreview("");
              }}
            >
              إلغاء
            </button>
          </div>
        </form>

        {message && (
          <div className="admin-message">
            {message}
          </div>
        )}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>اللعبة</th>
                <th>Platform</th>
                <th>Category</th>
                <th>ترتيب</th>
                <th>الإجراءات</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((game) => (
                <DashboardRow
                  key={game.id}
                  game={game}
                  onSaveOrder={saveOrder}
                  busy={busy}
                  onDelete={remove}
                />
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}